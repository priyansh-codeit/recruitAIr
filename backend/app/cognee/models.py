from typing import Optional
from pydantic import BaseModel

class CandidateResult(BaseModel):
    id: str
    name: str
    skills: list[str]
    experience_years: float
    score: float
    reason: str

    email: Optional[str] = None
    source_filename: Optional[str] = None