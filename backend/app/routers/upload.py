"""
POST /upload — recruiter uploads a resume PDF.

Flow:
  1. Receive PDF file
  2. Extract raw text (PyMuPDF)
  3. Generate a candidate_id (backend is the single source of truth for IDs)
  4. Call llm_client.parse_resume() -> structured Candidate
  5. Save structured Candidate in our own candidate_store (for later /search joins)
  6. Call cognee_client.remember_resume() -> stores raw text in Cognee for semantic recall
  7. Return the structured Candidate to the frontend
"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF

from app.models import CandidateUploadResponse
from app.services import llm_client, cognee_client
from app.storage import candidate_store

router = APIRouter(tags=["upload"])


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")


@router.post("/upload", response_model=CandidateUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF")

    candidate_id = str(uuid.uuid4())

    try:
        candidate = await llm_client.parse_resume(
            resume_text=resume_text,
            candidate_id=candidate_id,
            source_filename=file.filename,
        )
        candidate_store.save_candidate(candidate)

        await cognee_client.remember_resume(candidate_id=candidate_id, resume_text=resume_text)
        cognee_status = "stored"
    except Exception as e:
        # Don't crash the whole request if Cognee/LLM hiccups during the demo —
        # surface a clean error instead.
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {e}")

    return CandidateUploadResponse(candidate=candidate, cognee_status=cognee_status)
