from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SessionCreate(BaseModel):
    candidate_name: str

class ChatTurn(BaseModel):
    session_id: str
    message: str

class AssessmentReport(BaseModel):
    session_id: str
    scores: Dict[str, int]
    quotes: Dict[str, str]
    overall_score: float
    status: str
