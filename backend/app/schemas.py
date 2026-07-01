from pydantic import BaseModel
from typing import List, Optional

class CandidateNode(BaseModel):
    id: str
    name: str
    role: str
    skills: List[str]
    summary: str
    match_score: int
    reasoning: str
    matched_nodes: List[str]

class UploadResponse(BaseModel):
    success: bool
    message: str
    candidate: Optional[CandidateNode] = None

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    success: bool
    results: List[CandidateNode]
