from graph.state import InterviewState

def route_from_start(state: InterviewState):
    if not state.get("messages"):
        return "greeter"
        
    phase = state.get("current_phase")
    if phase == "greeting":
        return "question_selector"
    elif phase == "question" or phase == "followup":
        return "followup_decider"
    elif phase == "closer" or phase == "finished":
        return "END"
    return "question_selector"

def decide_followup(state: InterviewState):
    from langchain_core.messages import HumanMessage
    messages = state["messages"]
    if not messages:
        return "question_selector"
        
    followups = state.get("followup_count", 0)
    turn = state.get("turn_count", 0)
    
    if turn >= 5:
        return "closer"

    # Check if last user message is too short/vague — route to edge_case_handler
    last_human = next((m for m in reversed(messages) if isinstance(m, HumanMessage)), None)
    if last_human and len(last_human.content.strip()) < 12:
        if followups == 0:  # Only prompt once, then move on
            return "edge_case_handler"
        
    if followups >= 1:
        return "question_selector"
    else:
        return "responder"
