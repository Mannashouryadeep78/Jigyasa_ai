from typing import TypedDict, List, Annotated
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    session_id: str
    candidate_name: str
    resume_text: str
    messages: Annotated[List[BaseMessage], operator.add]
    current_phase: str
    questions_asked: List[str]
    answers_given: List[str]
    followup_count: int
    assessment: dict
    turn_count: int
