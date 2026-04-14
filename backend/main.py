from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
import asyncio
import time
import re as _re
from collections import defaultdict
from langchain_core.messages import HumanMessage, AIMessage

from models.schemas import SessionCreate, ChatTurn
from graph.builder import interview_graph
from services.supabase_client import get_supabase_client, log_session, save_assessment, update_session_status, get_session as db_get_session, save_session_state, load_session_state
from services.pdf_parser import extract_text_from_pdf
import httpx
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# ─── Constants ────────────────────────────────────────────────────────────────
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10 MB
_NAME_SANITIZE_RE = _re.compile(r'[^a-zA-Z0-9\s\-\'.]+')  # Allow letters, digits, spaces, hyphens, apostrophes

app = FastAPI(title="AI Tutor Screener API")

# ─── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:8080",
    "https://jigyasa-ai-wheat.vercel.app",
    "https://asa-ai-wheat.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase_client()

# ─── Per-Session Locking ──────────────────────────────────────────────────────
# Prevents concurrent /respond calls corrupting the same session's graph state
_session_locks: dict[str, tuple[asyncio.Lock, float]] = {}  # session_id -> (lock, last_used_timestamp)
_session_locks_mutex = asyncio.Lock()
_SESSION_LOCK_TTL = 3600  # purge locks unused for 1 hour

async def get_session_lock(session_id: str) -> asyncio.Lock:
    async with _session_locks_mutex:
        entry = _session_locks.get(session_id)
        if entry:
            lock, _ = entry
            _session_locks[session_id] = (lock, time.time())
            return lock
        lock = asyncio.Lock()
        _session_locks[session_id] = (lock, time.time())
        # Opportunistic cleanup: purge stale locks periodically
        if len(_session_locks) > 100:
            cutoff = time.time() - _SESSION_LOCK_TTL
            stale = [k for k, (lk, ts) in _session_locks.items() if ts < cutoff and not lk.locked()]
            for k in stale:
                del _session_locks[k]
        return lock

# ─── Rate Limiting ────────────────────────────────────────────────────────────
# Async-safe in-memory rate limiter: max 30 requests per IP per minute
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_rate_limit_lock = asyncio.Lock()
RATE_LIMIT = 30
RATE_WINDOW = 60  # seconds
_RATE_CLEANUP_THRESHOLD = 500  # purge dead IPs when store exceeds this size

async def check_rate_limit(ip: str):
    async with _rate_limit_lock:
        now = time.time()
        window_start = now - RATE_WINDOW
        _rate_limit_store[ip] = [t for t in _rate_limit_store[ip] if t > window_start]
        if len(_rate_limit_store[ip]) >= RATE_LIMIT:
            raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
        _rate_limit_store[ip].append(now)
        # Periodic cleanup of dead IPs
        if len(_rate_limit_store) > _RATE_CLEANUP_THRESHOLD:
            dead = [k for k, v in _rate_limit_store.items() if not v]
            for k in dead:
                del _rate_limit_store[k]

# ─── Auth Dependency (Fix #2) ─────────────────────────────────────────────────
# Validates Supabase JWT bearer token and returns user data
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header. Please sign in.")
    token = authorization.split(" ", 1)[1]
    try:
        resp = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {token}",
            },
            timeout=8,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired session. Please sign in again.")
        return resp.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=503, detail="Auth service timeout. Please try again.")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _sanitize_name(name: str) -> str:
    """Strip dangerous chars to prevent prompt injection via candidate_name."""
    return _NAME_SANITIZE_RE.sub('', name).strip()[:60] or "Candidate"

async def _validate_pdf(file: UploadFile) -> bytes:
    """Read and validate an uploaded PDF. Returns bytes or raises HTTPException."""
    file_bytes = await file.read()
    if len(file_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_PDF_SIZE // (1024*1024)}MB.")
    return file_bytes

def _verify_session_owner(session_id: str, user_id: str):
    """Check if the authenticated user owns this session. Raises 403 if not."""
    rows = db_get_session(session_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Session not found in database.")
    if rows[0].get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="You do not own this session.")

def _run_graph_sync(input_state, config):
    """Run the synchronous LangGraph stream in a blocking call (for use with to_thread)."""
    for event in interview_graph.stream(input_state, config):
        pass
    return interview_graph.get_state(config)


# ─── /session ────────────────────────────────────────────────────────────────
VALID_MODES = {"hr", "technical", "gd", "tutor"}

@app.post("/session")
async def create_session(
    request: Request,
    user_id: str = Form(...),
    candidate_name: str = Form(...),
    interview_mode: str = Form("hr"),
    file: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
):
    await check_rate_limit(request.client.host)
    if current_user.get("id") != user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")
    if interview_mode not in VALID_MODES:
        interview_mode = "hr"  # safe fallback

    # Sanitize candidate name to prevent prompt injection
    safe_name = _sanitize_name(candidate_name)

    session_id = str(uuid.uuid4())
    log_session(session_id, safe_name, user_id)

    resume_text = ""
    if file:
        file_bytes = await _validate_pdf(file)
        if file.filename and file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_bytes)

    config = {"configurable": {"thread_id": session_id}}
    initial_state = {
        "session_id": session_id,
        "candidate_name": safe_name,
        "resume_text": resume_text,
        "interview_mode": interview_mode,
        "messages": [],
        "current_phase": "start",
        "questions_asked": [],
        "answers_given": [],
        "followup_count": 0,
        "turn_count": 0
    }

    try:
        state = await asyncio.to_thread(_run_graph_sync, initial_state, config)
    except Exception as e:
        print(f"[ERROR] Graph stream failed during session create: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize interview session. Please try again.")

    last_message = state.values.get("messages", [])[-1].content if state.values.get("messages") else ""

    # Persist initial state so session can be recovered after a server restart
    save_session_state(session_id, {
        "interview_mode": interview_mode,
        "resume_text": resume_text[:8000],
        "current_phase": "greeting",
        "messages": [{"role": "ai", "content": last_message}]
    })

    return {"session_id": session_id, "message": last_message}


# ─── /respond ────────────────────────────────────────────────────────────────
@app.post("/respond")
async def respond(
    request: Request,
    turn: ChatTurn,
    current_user: dict = Depends(get_current_user),
):
    await check_rate_limit(request.client.host)

    # Ownership check: verify the caller owns this session
    _verify_session_owner(turn.session_id, current_user.get("id"))

    config = {"configurable": {"thread_id": turn.session_id}}
    state = interview_graph.get_state(config)

    if not state.values:
        # Attempt lazy reconstruction from persisted Supabase state before giving up
        rows = db_get_session(turn.session_id)
        db_row = rows[0] if rows else {}
        saved = load_session_state(turn.session_id)
        if saved and saved.get("messages"):
            messages = []
            for m in saved["messages"]:
                if m.get("role") == "user":
                    messages.append(HumanMessage(content=m["content"]))
                elif m.get("role") == "ai":
                    messages.append(AIMessage(content=m["content"]))
            human_count = sum(1 for m in messages if isinstance(m, HumanMessage))
            interview_graph.update_state(config, {
                "session_id": turn.session_id,
                "candidate_name": db_row.get("name", "Candidate"),
                "resume_text": saved.get("resume_text", ""),
                "interview_mode": saved.get("interview_mode", "hr"),
                "messages": messages,
                "current_phase": "question",
                "questions_asked": [],
                "answers_given": [],
                "followup_count": 0,
                "turn_count": human_count,
            })
            print(f"[INFO] Reconstructed session {turn.session_id} from Supabase ({len(messages)} messages)")
        else:
            raise HTTPException(status_code=404, detail="Session not found or expired. The server may have restarted. Please start a new session.")

    # Atomic try-acquire: raise 409 immediately if already locked
    lock = await get_session_lock(turn.session_id)
    if lock.locked():
        raise HTTPException(status_code=409, detail="A response is already being processed for this session. Please wait.")
    
    await lock.acquire()

    try:
        turn_count = state.values.get("turn_count", 0) + 1
        new_input = {
            "messages": [HumanMessage(content=turn.message)],
            "turn_count": turn_count
        }

        try:
            state = await asyncio.to_thread(_run_graph_sync, new_input, config)
        except Exception as e:
            print(f"[ERROR] Graph stream failed during respond: {e}")
            raise HTTPException(status_code=500, detail="AI response generation failed. Please try again.")

        last_message = state.values.get("messages", [])[-1].content
        status = state.values.get("current_phase")

        if status == "finished":
            assessment = state.values.get("assessment", {})
            save_assessment(turn.session_id, assessment.get("scores", {}), assessment.get("quotes", {}))
            update_session_status(turn.session_id, "finished")

        # Persist message history after every exchange for crash-recovery
        all_messages = state.values.get("messages", [])
        serialized = []
        for m in all_messages:
            if isinstance(m, HumanMessage):
                serialized.append({"role": "user", "content": m.content})
            elif isinstance(m, AIMessage):
                serialized.append({"role": "ai", "content": m.content})
        save_session_state(turn.session_id, {
            "interview_mode": state.values.get("interview_mode", "hr"),
            "resume_text": state.values.get("resume_text", "")[:8000],
            "current_phase": status,
            "messages": serialized
        })
    finally:
        lock.release()

    return {"message": last_message, "status": status}


# ─── /report/{session_id} ────────────────────────────────────────────────────
@app.get("/report/{session_id}")
async def get_report(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    # Ownership check
    _verify_session_owner(session_id, current_user.get("id"))

    config = {"configurable": {"thread_id": session_id}}
    state = interview_graph.get_state(config)

    if not state.values:
        raise HTTPException(status_code=404, detail="Session state not found. The server may have restarted.")

    if state.values.get("current_phase") != "finished":
        return {"status": "in_progress"}

    return state.values.get("assessment")


# ─── /session/{session_id} ───────────────────────────────────────────────────
@app.get("/session/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    # Ownership check
    _verify_session_owner(session_id, current_user.get("id"))

    config = {"configurable": {"thread_id": session_id}}
    state = interview_graph.get_state(config)

    if not state.values:
        # Graph state wiped (server restart / MemorySaver). Try to reconstruct from persisted state.
        rows = db_get_session(session_id)
        db_row = rows[0] if rows else {}

        # Finished/discontinued sessions don't need graph reconstruction
        if db_row.get("status") in ("finished", "discontinued"):
            return {
                "candidate_name": db_row.get("name", "Candidate"),
                "history": [],
                "status": db_row.get("status"),
                "restarted": True
            }

        saved = load_session_state(session_id)
        if saved and saved.get("messages"):
            # Rebuild messages from saved JSON
            messages = []
            for m in saved["messages"]:
                if m.get("role") == "user":
                    messages.append(HumanMessage(content=m["content"]))
                elif m.get("role") == "ai":
                    messages.append(AIMessage(content=m["content"]))

            human_count = sum(1 for m in messages if isinstance(m, HumanMessage))

            # Inject the full conversation back into MemorySaver so /respond works again
            interview_graph.update_state(config, {
                "session_id": session_id,
                "candidate_name": db_row.get("name", "Candidate"),
                "resume_text": saved.get("resume_text", ""),
                "interview_mode": saved.get("interview_mode", "hr"),
                "messages": messages,
                "current_phase": "question",  # route to followup_decider on next message
                "questions_asked": [],
                "answers_given": [],
                "followup_count": 0,
                "turn_count": human_count,
            })

            history = [{"role": m["role"], "content": m["content"]} for m in saved["messages"]]
            return {
                "candidate_name": db_row.get("name", "Candidate"),
                "history": history,
                "status": "question",  # no restarted flag — session is live again
            }

        # No saved state found at all — tell frontend to start fresh
        return {
            "candidate_name": db_row.get("name", "Candidate"),
            "history": [],
            "status": db_row.get("status", "active"),
            "restarted": True
        }

    messages = state.values.get("messages", [])
    history = []
    for m in messages:
        if isinstance(m, HumanMessage):
            history.append({"role": "user", "content": m.content})
        elif isinstance(m, AIMessage):
            history.append({"role": "ai", "content": m.content})

    return {
        "candidate_name": state.values.get("candidate_name", "Candidate"),
        "history": history,
        "status": state.values.get("current_phase")
    }


# ─── /session/{session_id}/discontinue ──────────────────────────────────────
@app.post("/session/{session_id}/discontinue")
async def discontinue_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    # Ownership check
    _verify_session_owner(session_id, current_user.get("id"))
    update_session_status(session_id, "discontinued")
    return {"status": "success"}


# ─── /prep/generate ─────────────────────────────────────────────────────────
# PUBLIC endpoint — no auth required. Complimentary access for all users.
@app.post("/prep/generate")
async def generate_prep(
    request: Request,
    file: UploadFile = File(...),
):
    await check_rate_limit(request.client.host)
    import json
    from langchain_core.messages import HumanMessage
    from services.groq_client import get_json_llm
    from services.pdf_parser import extract_text_from_pdf

    try:
        file_bytes = await _validate_pdf(file)
        resume_text = extract_text_from_pdf(file_bytes)

        safe_resume = resume_text[:6000].replace("{", "{{").replace("}", "}}")

        prompt = f"""You are an elite technical interviewer and career coach with 15+ years of hiring experience.
Analyse the following resume deeply and generate exactly 20 highly targeted interview questions — a mix of:
- 8 technical/domain-specific questions (probe actual tools, projects, and decisions from their resume)
- 7 behavioral questions (STAR-method style — challenges, teamwork, leadership, failures, growth)
- 3 strategic questions (career goals, motivation, why this role, vision)
- 2 curveball questions (a tough scenario or a creative problem relevant to their field)

For every question, write a high-quality suggested answer (4-6 sentences) that:
- References specific details from their actual resume
- Follows the STAR method for behavioral questions
- Demonstrates expert-level thinking, not just textbook answers
- Sounds natural and confident, as if spoken in a real interview

Resume Data:
{safe_resume}

CRITICAL: Output ONLY valid JSON. Root object must have a single key \"qa_pairs\" containing an array of exactly 20 objects. Each object must have \"question\" (string) and \"suggested_answer\" (string). No markdown, no extra text."""

        json_llm = get_json_llm()
        response = json_llm.invoke([HumanMessage(content=prompt)])

        raw_content = response.content
        import re
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            data = json.loads(json_str)
        else:
            data = json.loads(raw_content.replace("```json", "").replace("```", "").strip())

        if "qa_pairs" in data and isinstance(data["qa_pairs"], list):
            data["qa_pairs"] = data["qa_pairs"][:20]

        return data
    except Exception as e:
        print("Prep Route Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to parse resume or generate questions.")


# ─── /ats/check ─────────────────────────────────────────────────────────────
# PUBLIC endpoint — no auth required. Max value on landing page.
@app.post("/ats/check")
async def ats_check(
    request: Request,
    file: UploadFile = File(...),
):
    await check_rate_limit(request.client.host)
    import json, re
    from langchain_core.messages import HumanMessage
    from services.groq_client import get_json_llm
    from services.pdf_parser import extract_text_from_pdf

    try:
        file_bytes = await _validate_pdf(file)
        resume_text = extract_text_from_pdf(file_bytes)
        safe_resume = resume_text[:6000].replace("{", "{{").replace("}", "}}")

        prompt = f"""You are a senior ATS (Applicant Tracking System) expert who has reviewed 10,000+ resumes and knows exactly how Workday, Greenhouse, Lever, and iCIMS parse and rank candidates.

Carefully analyse the following resume and produce an accurate, honest ATS compatibility report.

SCORING GUIDE (be strict and realistic — do not inflate scores):
- 90-100: Near-perfect ATS resume. Clean formatting, all key sections, quantified achievements, strong action verbs, relevant keywords. Likely to pass any ATS.
- 75-89: Good resume with minor gaps. Passes most ATS systems but may lose ranking on competitive roles.
- 55-74: Average. Will pass some ATS filters but gets deprioritised. Needs meaningful improvements.
- 35-54: Weak. Likely rejected by strict ATS filters. Missing key elements or has parsing-breaking formatting.
- 0-34: Critical failures. Tables, graphics, missing contact info, or keyword-free — most ATS will reject automatically.

Grade mapping: 90+=A, 75-89=B, 55-74=C, 35-54=D, <35=F

Resume:
{safe_resume}

Return ONLY valid JSON:
{{
  "ats_score": <integer 0-100, calibrated strictly per the guide above>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "sections_found": [<exact section headings detected in the resume>],
  "sections_missing": [<important sections absent, e.g. "Professional Summary", "LinkedIn URL", "GitHub Profile", "Certifications", "Skills Section">],
  "keyword_gaps": [<4-6 specific missing elements that cost ATS ranking, e.g. "No quantified achievements (add numbers: % improved, $ saved, X users)", "Missing industry-standard tool keywords for their field", "Weak action verbs — replace with impact verbs like Architected, Spearheaded, Reduced">],
  "formatting_issues": [<2-4 concrete formatting problems, e.g. "Resume likely uses a table layout — ATS cannot parse tables", "No consistent date formatting", "Headers may use text boxes which ATS ignores">],
  "quick_wins": [<exactly 4 specific one-sentence actions the candidate can do TODAY to improve their score — be concrete, not generic>],
  "ats_verdict": <one honest, specific sentence on their ATS pass likelihood for a competitive job posting>
}}

Output nothing but the JSON."""

        json_llm = get_json_llm()
        response = json_llm.invoke([HumanMessage(content=prompt)])
        raw = response.content

        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
        else:
            data = json.loads(raw.replace("```json", "").replace("```", "").strip())

        return data
    except Exception as e:
        print("ATS Check Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to analyse resume. Please try again.")


# ─── /tts ────────────────────────────────────────────────────────────────────
class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
async def generate_tts(
    req: TTSRequest,
    current_user: dict = Depends(get_current_user),
):
    from fastapi.responses import Response
    import io

    text = req.text.strip()
    if not text:
        return Response(status_code=204)

    # ── Strategy 1: edge-tts Neural (Microsoft) — most natural-sounding ─────────
    # These Neural voices use deep-learning prosody and sound like a real person.
    # Rate -8% = slightly deliberate interview pace; volume unchanged.
    try:
        import edge_tts
        print("[TTS] Trying edge-tts Neural voices...")
        VOICES = [
            "en-US-AndrewNeural",   # warm, natural male — best for an interviewer
            "en-US-AriaNeural",     # conversational female — friendly & clear
            "en-US-BrianNeural",    # calm, professional male
            "en-US-JennyNeural",    # clear, warm female fallback
        ]
        for voice in VOICES:
            try:
                communicate = edge_tts.Communicate(text, voice, rate="-8%", volume="+0%")
                buf = io.BytesIO()
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        buf.write(chunk["data"])
                audio_bytes = buf.getvalue()
                if audio_bytes and len(audio_bytes) > 100:
                    print(f"[TTS] edge-tts success with {voice} — {len(audio_bytes)} bytes")
                    return Response(content=audio_bytes, media_type="audio/mpeg")
                print(f"[TTS] edge-tts {voice} returned no audio.")
            except Exception as ve:
                print(f"[TTS] edge-tts {voice} error: {ve}")
    except Exception as e:
        print(f"[TTS] edge-tts import/setup failed: {e}")

    # ── Strategy 2: gTTS (Google) — reliable fallback, less natural ──────────
    try:
        from gtts import gTTS
        print("[TTS] Falling back to gTTS...")
        tts = gTTS(text=text, lang='en', tld='com', slow=False)
        buf2 = io.BytesIO()
        tts.write_to_fp(buf2)
        audio_bytes2 = buf2.getvalue()
        if audio_bytes2 and len(audio_bytes2) > 100:
            print(f"[TTS] gTTS success — {len(audio_bytes2)} bytes")
            return Response(content=audio_bytes2, media_type="audio/mpeg")
        print("[TTS] gTTS returned empty audio.")
    except Exception as e:
        print(f"[TTS] gTTS failed: {e}")

    # ── Strategy 3: 204 — tells the frontend to use native browser TTS ─────────
    print("[TTS] All strategies failed. Returning 204 for native TTS fallback.")
    return Response(status_code=204)


# ─── /transcribe ─────────────────────────────────────────────────────────────
@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    from services.groq_client import transcribe_audio
    import tempfile
    
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = transcribe_audio(tmp_path)
        return {"transcript": text}
    except Exception as e:
        print(f"[TRANSCRIBE ERROR] {e}")
        raise HTTPException(status_code=500, detail="Transcription failed. Please try again.")
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ─── /analytics/guidance ─────────────────────────────────────────────────────
class AnalyticsRequest(BaseModel):
    history: list[dict]

@app.post("/analytics/guidance")
async def generate_analytics_guidance(
    req: AnalyticsRequest,
    current_user: dict = Depends(get_current_user),
):
    import json, re
    from langchain_core.messages import HumanMessage, SystemMessage
    from services.groq_client import get_json_llm

    key_totals: dict[str, float] = {}
    key_counts: dict[str, int] = {}
    session_context = []

    for item in req.history:
        if not isinstance(item, dict):
            continue
        scores = item.get("scores", item)
        name = item.get("session_name", "Unknown Interview")
        date = item.get("date", "")

        if not isinstance(scores, dict):
            continue

        session_lines = []
        for k, v in scores.items():
            try:
                val = float(v)
                key_totals[k] = key_totals.get(k, 0.0) + val
                key_counts[k] = key_counts.get(k, 0) + 1
                session_lines.append(f"  {k}: {val}/5")
            except (ValueError, TypeError):
                continue

        if session_lines:
            session_context.append(f"- {name} ({date}):\n" + "\n".join(session_lines))

    if not key_totals:
        return {
            "overview": "No completed interview data found yet. Complete at least one interview session to receive your personalised coaching report.",
            "action_items": [
                "Complete your first Jigyasa interview session to unlock AI coaching.",
                "Use the Resume-to-Prep Matrix tool on the home page to generate practice questions.",
                "Review the interview guidance articles in your dashboard."
            ]
        }

    averages = {k: round(key_totals[k] / key_counts[k], 2) for k in key_totals if key_counts[k] > 0}
    sorted_scores = sorted(averages.items(), key=lambda x: x[1])
    weakest = sorted_scores[:2]
    strongest = sorted(averages.items(), key=lambda x: x[1], reverse=True)[:2]

    sessions_text = "\n".join(session_context) if session_context else "Score data provided."
    averages_text = "\n".join([f"  {k}: {v}/5" for k, v in averages.items()])

    system_msg = "You are a senior engineering manager and expert interview coach. You provide highly personalised, data-driven feedback to candidates based on their actual interview performance data. Always respond in JSON."

    user_msg = f"""A candidate has completed {len(session_context)} interview session(s) on the Jigyasa AI Interview Platform. Here is their full performance history:

{sessions_text}

Their CALCULATED AVERAGE scores across all sessions (out of 5):
{averages_text}

Their STRONGEST areas: {', '.join([f"{k} ({v}/5)" for k, v in strongest])}
Their WEAKEST areas (needs most improvement): {', '.join([f"{k} ({v}/5)" for k, v in weakest])}

Write a personalised 2-paragraph coaching report:
- Paragraph 1: Acknowledge their strengths with the exact scores, be specific and encouraging.
- Paragraph 2: Clearly identify their 1-2 weakest areas by name and exact average score, explain what this means practically, and tell them to use Jigyasa's complimentary Resume-to-Prep Matrix question generator (on the landing page) to get a custom question bank for targeted practice.

Then provide exactly 3 specific, actionable improvement steps tailored to their WEAKEST areas. At least one step must mention using the Resume-to-Prep Matrix question generator.

Respond ONLY with this JSON structure:
{{
  "overview": "paragraph 1 text\\n\\nparagraph 2 text",
  "action_items": ["step 1", "step 2", "step 3"]
}}"""

    try:
        json_llm = get_json_llm()
        response = json_llm.invoke([
            SystemMessage(content=system_msg),
            HumanMessage(content=user_msg)
        ])
        raw_content = response.content
        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw_content, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
            else:
                raise ValueError("No JSON found in response")

        if "overview" not in data or "action_items" not in data:
            raise ValueError("Missing required keys in response")

        return data

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Analytics Route Error:", str(e))
        weak_names = [k for k, v in weakest]
        return {
            "overview": f"Based on your {len(session_context)} completed interview(s), your average scores show strengths in {strongest[0][0]} ({strongest[0][1]}/5). Your primary area for growth is {weakest[0][0]} ({weakest[0][1]}/5) — a very common gap that can be closed with consistent, targeted practice.\n\nWe recommend using Jigyasa's complimentary Resume-to-Prep Matrix on the home page to generate a custom question bank focused specifically on {', '.join(weak_names)}.",
            "action_items": [
                f"Use the Resume-to-Prep Matrix question generator on the Jigyasa home page to get practice questions targeting your weakest area: {weakest[0][0]}.",
                f"For each upcoming interview, prepare 2-3 strong examples that demonstrate {weakest[0][0]} using the STAR method (Situation, Task, Action, Result).",
                "Complete a mock interview session weekly and track your scores in this Analytics dashboard to measure improvement over time."
            ]
        }
