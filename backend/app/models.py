"""
Pydantic models shared across routers and services.

These define the contract between:
  - Frontend (Yadav Ji) <-> Backend (you)
  - Backend (you) <-> Cognee module (Gautam)
  - Backend (you) <-> LLM/ranking module (AI lead)

Do not change field names casually — teammates' code depends on these shapes.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


# ---------- Candidates (full structured record — owned by backend storage) ----------

class Candidate(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0.0
    education: Optional[str] = None
    internships: int = 0
    projects: List[str] = []
    certifications: List[str] = []
    links: List[str] = []                  # github, linkedin, portfolio
    source_filename: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class CandidateUploadResponse(BaseModel):
    candidate: Candidate
    cognee_status: str                     # "stored" | "failed" | "pending"


# ---------- Cognee recall result (what Gautam's search_candidates() returns) ----------
# NOTE: Cognee does NOT return full structured candidates. It returns matches by ID,
# which we then join against our own candidate store to build CandidateResult.

class CogneeMatch(BaseModel):
    candidate_id: str
    score: float
    reason: str                            # semantic match explanation/snippet from Cognee


# ---------- Search (final response sent to frontend) ----------

class SearchRequest(BaseModel):
    query: str                             # natural language, e.g. "backend engineers with FastAPI and AWS"
    job_id: Optional[str] = None
    top_k: int = 10


class CandidateResult(BaseModel):
    id: str
    name: str
    skills: List[str] = []
    experience_years: float = 0.0
    score: float
    reason: str
    email: Optional[str] = None
    source_filename: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: List[CandidateResult]


# ---------- Compare ----------

class CompareRequest(BaseModel):
    candidate_id_a: str
    candidate_id_b: str
    job_id: Optional[str] = None


class CompareResponse(BaseModel):
    candidate_a: Candidate
    candidate_b: Candidate
    winner_id: Optional[str] = None
    explanation: str


# ---------- Recruiter feedback / interaction memory ----------

class FeedbackAction(str, Enum):
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    INTERVIEWED = "interviewed"
    HIRED = "hired"
    DOWNLOADED = "downloaded"
    COMPARED = "compared"


class FeedbackRequest(BaseModel):
    candidate_id: str
    action: FeedbackAction
    job_id: Optional[str] = None
    notes: Optional[str] = None
    recruiter_id: str = "default_recruiter"


class FeedbackResponse(BaseModel):
    status: str
    message: str
