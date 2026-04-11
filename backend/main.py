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
    import json
    from langchain_core.messages import HumanMessage
    from services.groq_client import get_json_llm

    key_totals = {}
    key_counts = {}
    for score_obj in req.history:
        for k, v in score_obj.items():
            key_totals[k] = key_totals.get(k, 0) + v
            key_counts[k] = key_counts.get(k, 0) + 1
            
    averages = {k: round(key_totals[k] / key_counts[k], 2) for k in key_totals}
    avg_str = json.dumps(averages)

    prompt = f"""You are a senior engineering manager and executive coach.
The candidate has taken multiple interview assessments. We have calculated their AVERAGE scores (out of 5) across multiple dimensions:
{avg_str}

Analyze their average metrics. Write a highly personalized, encouraging 2-paragraph development plan explaining what they excel at, where they are falling behind compared to industry peers, and 3 specific actionable steps they can take to improve.
IMPORTANT: You MUST explicitly recommend that they use our complimentary 'Resume-to-Prep Matrix' question generator tool to practice and improve their weaknesses.

Output strictly in JSON format. The root must be an object with:
"overview" (string: 2 paragraphs),
"action_items" (array of strings: exactly 3 precise steps)
Output nothing else but the JSON."""

    try:
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
        return data
    except Exception as e:
        print("Analytics Route Error:", str(e))
        return {
            "overview": "We couldn't generate a personalized plan right now due to server constraints, but based on your data history, focus on practicing cross-domain technical communication.", 
            "action_items": ["Review fundamental system design patterns", "Practice thinking out loud during coding", "Take mock interviews to reduce anxiety"]
        }
