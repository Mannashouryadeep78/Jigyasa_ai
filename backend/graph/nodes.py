from typing import Dict, Any
import json
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from graph.state import InterviewState
from services.groq_client import get_llm, get_json_llm
from prompts.system import get_system_prompt
from prompts.rubric import get_rubric_prompt

llm = get_llm()
json_llm = get_json_llm()

def format_transcript(messages):
    transcript = ""
    for msg in messages:
        if isinstance(msg, HumanMessage):
            transcript += f"Candidate: {msg.content}\n"
        elif isinstance(msg, AIMessage):
            transcript += f"Interviewer: {msg.content}\n"
    return transcript.replace("{", "{{").replace("}", "}}")

def greeter(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    name = state.get("candidate_name", "there")
    
    greetings = {
        "hr": f"Hi {name}, great to meet you! I'm Alex, your Tutor HR interviewer today. I'll be asking a few questions about your pedagogical alignment and school culture fit. How are you doing?",
        "technical": f"Hey {name}, welcome! I'm Jordan and I'll be your Domain Specific interviewer today. I'm excited to dive into your subject expertise and classroom methods. How are you?",
        "gd": f"Hi {name}! I'm Morgan, your Communication and Policy facilitator today. We're going to debate some educational trends and current affairs. Ready to jump in?",
        "tutor": f"Hello {name}, I'm Professor Maria. It's a pleasure to meet you. Today we'll be discussing your pedagogical approach and how you handle various classroom scenarios. Ready to begin?",
    }
    greeting = greetings.get(mode, greetings["hr"])
    return {"messages": [AIMessage(content=greeting)], "current_phase": "greeting", "questions_asked": []}

def question_selector(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    safe_resume = state.get("resume_text", "No resume provided.")[:5000].replace("{", "{{").replace("}", "}}")
    
    system_prompt = get_system_prompt(mode)
    sys_msg = SystemMessage(content=system_prompt.format(
        candidate_name=state.get("candidate_name", "there"),
        resume_text=safe_resume
    ))
    
    # Mode-specific instruction for question selection
    instructions = {
        "hr": "Please ask the next HR question from your question bank that hasn't been asked yet. Keep it brief and conversational.",
        "technical": "Ask the next technical question about a specific part of their resume that hasn't been explored yet. Be specific and targeted.",
        "gd": "Introduce the discussion topic if you haven't already, or introduce a new angle / counterpoint to keep the debate alive. Stay sharp and brief.",
        "tutor": "Present the next pedagogical scenario or analytical teaching challenge. If no resume is present, focus on your core question bank. Keep it professional and concise.",
    }
    prompt = instructions.get(mode, instructions["hr"])
    
    history = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    messages = [sys_msg] + history + [HumanMessage(content=prompt)]
    response = llm.invoke(messages)
    
    return {"messages": [response], "current_phase": "question", "followup_count": 0}

def responder(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    safe_resume = state.get("resume_text", "No resume provided.")[:5000].replace("{", "{{").replace("}", "}}")
    
    system_prompt = get_system_prompt(mode)
    sys_msg = SystemMessage(content=system_prompt.format(
        candidate_name=state.get("candidate_name", "there"),
        resume_text=safe_resume
    ))
    
    history = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    messages = [sys_msg] + history
    
    response = llm.invoke(messages)
    return {"messages": [response], "followup_count": state.get("followup_count", 0) + 1, "current_phase": "followup"}

def followup_decider(state: InterviewState):
    # Pure routing node — logic lives in edges.py
    return {}

def edge_case_handler(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    prompts = {
        "hr": "I'd love to hear a bit more about that. Could you walk me through a specific example?",
        "technical": "Interesting — could you give me more technical detail on how that actually worked?",
        "gd": "That's an interesting point — could you expand on your reasoning a bit more?",
        "tutor": "I'd like to understand that deeper — how exactly does that approach benefit a struggling student?",
    }
    msg = prompts.get(mode, prompts["hr"])
    return {"messages": [AIMessage(content=msg)], "current_phase": "followup"}

def closer(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    closers = {
        "hr": f"That concludes our Tutor HR session! It was really lovely getting to know you and your educational values. The school board will review this and be in touch soon. Best of luck!",
        "technical": f"That wraps up our Domain Specific interview! Really enjoyed exploring your subject expertise. The team will be in touch with feedback for you. Have a great day!",
        "gd": f"Great discussion today — you brought some really solid arguments regarding educational policy to the table! That's a wrap on our Communication round. Feedback will be shared with you soon.",
        "tutor": "That concludes our pedagogical discussion. I truly appreciated your insights into student learning. We will review the session and get back to you with a detailed assessment. Thank you!",
    }
    msg = closers.get(mode, closers["hr"])
    return {"messages": [AIMessage(content=msg)], "current_phase": "closer"}

def assessor(state: InterviewState):
    mode = state.get("interview_mode", "hr")
    transcript = format_transcript(state["messages"])
    transcript = transcript[-25000:]
    
    rubric_prompt = get_rubric_prompt(mode)
    prompt = rubric_prompt.format(transcript=transcript)
    
    raw_content = ""
    try:
        response = json_llm.invoke([HumanMessage(content=prompt)])
        raw_content = response.content
        import re
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            assessment = json.loads(json_str)
        else:
            assessment = json.loads(raw_content.replace("```json", "").replace("```", "").strip())
    except Exception as e:
        error_msg = str(e)
        content_preview = raw_content[:200] if raw_content else "No content generated."
        assessment = {
            "error": f"Parse Error: {error_msg} | Content: {content_preview}...",
            "scores": {}, "quotes": {}, "wrong_answers": []
        }
        
    return {"assessment": assessment, "current_phase": "finished"}
