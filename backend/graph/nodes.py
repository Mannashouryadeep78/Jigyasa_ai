from typing import Dict, Any
import json
import random
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
    
    # Inject a random variation seed so the LLM doesn't repeat the same phrasing each session
    variation_seed = random.randint(1000, 9999)
    hr_angles = [
        "Focus on a challenge or failure they faced and how they grew from it.",
        "Probe their motivation and what drives them professionally.",
        "Explore how they collaborate with difficult team members.",
        "Ask about their proudest achievement and the specific impact they made.",
        "Dig into their long-term career vision and how this role fits.",
        "Ask about a time they had to adapt quickly to unexpected change.",
        "Explore how they handle feedback or criticism from a manager.",
    ]
    gd_pivots = [
        "Introduce a sharp counterargument to their last point.",
        "Ask them to steelman the opposing side of the argument.",
        "Bring in a real-world statistic or scenario to challenge their view.",
        "Ask them to summarise all perspectives and give a final verdict.",
        "Introduce a completely new angle: ethical implications.",
        "Ask: what would the policy implications be if their view were adopted?",
    ]
    tutor_scenarios = [
        "Ask them to explain a concept to a 7-year-old using only one analogy.",
        "Probe how they'd handle a student who keeps making the same mistake.",
        "Ask how they'd re-engage a student who has completely zoned out.",
        "Ask how they'd adapt a lesson plan mid-session if the student is clearly lost.",
        "Probe how they'd give encouraging feedback after a really poor performance.",
        "Ask them to describe a time they had to simplify something complex for a struggling learner.",
    ]

    # Mode-specific instruction for question selection
    instructions = {
        "hr": (
            f"[Session variation #{variation_seed}] "
            f"Ask the next HR question from your bank that hasn't been covered yet. "
            f"Angle for this question: {random.choice(hr_angles)} "
            "Rephrase naturally — never read verbatim from the bank. Keep it brief and conversational."
        ),
        "technical": (
            f"[Session variation #{variation_seed}] "
            "Ask the next technical question about a DIFFERENT part of their resume that hasn't been explored yet. "
            "Pick a random project, technology, or decision they made. Be specific and targeted. "
            "Never ask the same angle twice."
        ),
        "gd": (
            f"[Session variation #{variation_seed}] "
            f"{random.choice(gd_pivots)} Stay sharp, brief (1-2 sentences), and intellectually honest."
        ),
        "tutor": (
            f"[Session variation #{variation_seed}] "
            f"{random.choice(tutor_scenarios)} "
            "Present it naturally and conversationally. Keep it to 1-2 sentences."
        ),
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
