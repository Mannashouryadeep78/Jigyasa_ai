from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from langchain_core.messages import HumanMessage, AIMessage

from models.schemas import SessionCreate, ChatTurn
from graph.builder import interview_graph
from services.supabase_client import get_supabase_client, log_session, save_assessment, update_session_status
from services.pdf_parser import extract_text_from_pdf

app = FastAPI(title="AI Tutor Screener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend to access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase_client()

@app.post("/session")
async def create_session(
    user_id: str = Form(...),
    candidate_name: str = Form(...),
    file: UploadFile = File(None)
):
    session_id = str(uuid.uuid4())
    log_session(supabase, session_id, candidate_name, user_id)
    
    resume_text = ""
    if file:
        file_bytes = await file.read()
        if file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_bytes)
            
    # Initialize graph state
    config = {"configurable": {"thread_id": session_id}}
    
    # Trigger greeter
    initial_state = {
        "session_id": session_id,
        "candidate_name": candidate_name,
        "resume_text": resume_text,
        "messages": [],
        "current_phase": "start",
        "questions_asked": [],
        "answers_given": [],
        "followup_count": 0,
        "turn_count": 0
    }
    
    # Run the graph until it pauses (after greeter sends its message, we wait for user input)
    # Actually, in our graph, it will run until it needs input. 
    # Let's adjust: The graph should process the user's input, not run infinitely.
    
    for event in interview_graph.stream(initial_state, config):
        pass
        
    state = interview_graph.get_state(config)
    last_message = state.values.get("messages", [])[-1].content if state.values.get("messages") else ""
    
    return {"session_id": session_id, "message": last_message}

@app.post("/respond")
async def respond(turn: ChatTurn):
    config = {"configurable": {"thread_id": turn.session_id}}
    state = interview_graph.get_state(config)
    
    if not state.values:
        raise HTTPException(status_code=404, detail="Session not found")
        
    turn_count = state.values.get("turn_count", 0) + 1
    
    # Trigger graph execution from START with the new message
    new_input = {
        "messages": [HumanMessage(content=turn.message)],
        "turn_count": turn_count
    }
    
    for event in interview_graph.stream(new_input, config):
        pass

    state = interview_graph.get_state(config)
    
    # Get last message
    last_message = state.values.get("messages", [])[-1].content
    status = state.values.get("current_phase")
    
    if status == "finished":
        assessment = state.values.get("assessment", {})
        save_assessment(supabase, turn.session_id, assessment.get("scores", {}), assessment.get("quotes", {}))
        update_session_status(supabase, turn.session_id, "finished")
        
    return {"message": last_message, "status": status}

@app.get("/report/{session_id}")
async def get_report(session_id: str):
    config = {"configurable": {"thread_id": session_id}}
    state = interview_graph.get_state(config)
    
    if not state.values:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if state.values.get("current_phase") != "finished":
        return {"status": "in_progress"}
        
    return state.values.get("assessment")

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    config = {"configurable": {"thread_id": session_id}}
    state = interview_graph.get_state(config)
    
    if not state.values:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = state.values.get("messages", [])
    history = []
    
    # We want to format the history roughly how the frontend expects it
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

@app.post("/session/{session_id}/discontinue")
async def discontinue_session(session_id: str):
    # Just update the DB to say 'discontinued'
    update_session_status(supabase, session_id, "discontinued")
    return {"status": "success"}

@app.post("/prep/generate")
async def generate_prep(file: UploadFile = File(...)):
    import json
    from langchain_core.messages import HumanMessage
    from services.groq_client import get_json_llm
    from services.pdf_parser import extract_text_from_pdf

    try:
        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        
        # Keep resume text reasonable to prevent TPM limit crashes
        safe_resume = resume_text[:6000].replace("{", "{{").replace("}", "}}")
        
        prompt = f"""You are an elite technical interviewer and career coach.
Based on the following candidate's resume, thoughtfully generate exactly 15 likely interview questions (both technical deep-dives and behavioral).
For every question, provide a suggested high-quality answer demonstrating their specific expertise.

Resume Data:
{safe_resume}

You MUST output strictly in JSON format. The root must be a JSON object with a single key "qa_pairs" containing an array of exactly 15 objects. Each object must have a "question" (string) and "suggested_answer" (string). Output nothing else but the JSON."""

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
            
        # Hard cap the output to exactly 15 to prevent LLM over-generation
        if "qa_pairs" in data and isinstance(data["qa_pairs"], list):
            data["qa_pairs"] = data["qa_pairs"][:15]
            
        return data
    except Exception as e:
        print("Prep Route Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to parse resume or generate questions.")

class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
async def generate_tts(req: TTSRequest):
    import edge_tts
    from fastapi.responses import StreamingResponse

    async def audio_stream():
        try:
            communicate = edge_tts.Communicate(req.text, "en-US-BrianNeural") # Brian sounds like a professional interviewer
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
        except Exception as e:
            print(f"TTS Streaming Error: {e}")

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")

class AnalyticsRequest(BaseModel):
    history: list[dict]

@app.post("/analytics/guidance")
async def generate_analytics_guidance(req: AnalyticsRequest):
    import json, re
    from langchain_core.messages import HumanMessage, SystemMessage
    from services.groq_client import get_json_llm

    # Each item in history has: session_name, date, scores (dict of str->float)
    # Calculate per-field averages across all sessions
    key_totals: dict[str, float] = {}
    key_counts: dict[str, int] = {}
    session_context = []

    for item in req.history:
        if not isinstance(item, dict):
            continue
        # Support both flat scores dict (old) and rich {session_name, date, scores} (new)
        scores = item.get("scores", item)  # fall back to item itself if no "scores" key
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

    # Sort to highlight weakest areas first
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
        # Try direct parse first, then regex extraction
        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw_content, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
            else:
                raise ValueError("No JSON found in response")

        # Validate required keys
        if "overview" not in data or "action_items" not in data:
            raise ValueError("Missing required keys in response")

        return data

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Analytics Route Error:", str(e))
        # Return meaningful fallback based on computed averages
        weak_names = [k for k, v in weakest]
        return {
            "overview": f"Based on your {len(session_context)} completed interview(s), your average scores show strengths in {strongest[0][0]} ({strongest[0][1]}/5). Your primary area for growth is {weakest[0][0]} ({weakest[0][1]}/5) — a very common gap that can be closed with consistent, targeted practice.\n\nWe recommend using Jigyasa's complimentary Resume-to-Prep Matrix on the home page to generate a custom question bank focused specifically on {', '.join(weak_names)}. This tool analyses your resume and generates role-specific interview questions to help you practise the exact scenarios where you need improvement.",
            "action_items": [
                f"Use the Resume-to-Prep Matrix question generator on the Jigyasa home page to get practice questions targeting your weakest area: {weakest[0][0]}.",
                f"For each upcoming interview, prepare 2-3 strong examples that demonstrate {weakest[0][0]} — structure them using the STAR method (Situation, Task, Action, Result).",
                "Book a mock interview session every week and track your scores in this Analytics dashboard to monitor improvement over time."
            ]
        }

