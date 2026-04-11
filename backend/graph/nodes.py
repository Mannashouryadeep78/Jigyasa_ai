from typing import Dict, Any
import json
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from graph.state import InterviewState
from services.groq_client import get_llm, get_json_llm
from prompts.system import MASTER_PROMPT
from prompts.rubric import RUBRIC_PROMPT

llm = get_llm()
json_llm = get_json_llm()

def format_transcript(messages):
    transcript = ""
    for msg in messages:
        if isinstance(msg, HumanMessage):
            transcript += f"Candidate: {msg.content}\n"
        elif isinstance(msg, AIMessage):
            transcript += f"Screener: {msg.content}\n"
    return transcript.replace("{", "{{").replace("}", "}}")

def greeter(state: InterviewState):
    name = state.get("candidate_name", "there")
    greeting = f"Hi {name}, it's great to meet you! I'm the AI Screener. I'll be asking you a few questions today. How are you doing?"
    return {"messages": [AIMessage(content=greeting)], "current_phase": "greeting", "questions_asked": []}

def question_selector(state: InterviewState):
    # Truncate resume to prevent exceeding LLM context or TPM limits
    safe_resume = state.get("resume_text", "No resume provided.")[:3000].replace("{", "{{").replace("}", "}}")
    sys_msg = SystemMessage(content=MASTER_PROMPT.format(
        candidate_name=state.get("candidate_name", "there"),
        resume_text=safe_resume
    ))
    
    prompt = "Please ask the next question from your question bank that hasn't been asked yet. Keep it brief."
    
    # Keep only the last 6 messages in context to aggressively prevent TPM crashes
    history = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    messages = [sys_msg] + history + [HumanMessage(content=prompt)]
    response = llm.invoke(messages)
    
    return {"messages": [response], "current_phase": "question", "followup_count": 0}

def responder(state: InterviewState):
    # Generates a natural reply/followup
    safe_resume = state.get("resume_text", "No resume provided.")[:3000].replace("{", "{{").replace("}", "}}")
    sys_msg = SystemMessage(content=MASTER_PROMPT.format(
        candidate_name=state.get("candidate_name", "there"),
        resume_text=safe_resume
    ))
    
    # Keep only the last 6 messages in context
    history = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    messages = [sys_msg] + history
    
    response = llm.invoke(messages)
    return {"messages": [response], "followup_count": state.get("followup_count", 0) + 1, "current_phase": "followup"}

def followup_decider(state: InterviewState):
    # This is a pure routing node — logic lives in edges.py.
    # MUST return empty dict, not full state, because messages uses operator.add
    # and returning state would re-append ALL messages, doubling the history.
    return {}

def edge_case_handler(state: InterviewState):
    # Handles brief/vague responses
    msg = "I'd love to hear a bit more about that. Could you elaborate or give a specific example?"
    return {"messages": [AIMessage(content=msg)], "current_phase": "followup"}

def closer(state: InterviewState):
    msg = "That's all the questions I have! Thank you so much for your time. The team will review this and get back to you soon. Have a great day!"
    return {"messages": [AIMessage(content=msg)], "current_phase": "closer"}

def assessor(state: InterviewState):
    transcript = format_transcript(state["messages"])
    # Truncate strictly to fit inside llama-3.1-8b-instant 8192 token limit
    transcript = transcript[-25000:] 
    prompt = RUBRIC_PROMPT.format(transcript=transcript)
    
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
            # Fallback to direct parse if regex fails to match a top-level brace
            assessment = json.loads(raw_content.replace("```json", "").replace("```", "").strip())
    except Exception as e:
        error_msg = str(e)
        content_preview = raw_content[:200] if raw_content else "No content generated (API blocked)."
        assessment = {"error": f"Parse Error: {error_msg} | Content: {content_preview}...", "scores": {}, "quotes": {}, "wrong_answers": []}
        
    return {"assessment": assessment, "current_phase": "finished"}
