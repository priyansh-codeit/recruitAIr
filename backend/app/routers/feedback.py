"""
POST /feedback — recruiter actions (viewed/shortlisted/rejected/etc.)

This is the most important endpoint for the demo: every call here feeds Cognee's
"Improve" step, which is what lets the system re-rank candidates based on learned
recruiter preferences.
"""

from fastapi import APIRouter, HTTPException

from app.models import FeedbackRequest, FeedbackResponse
from app.services import cognee_client
from app.storage import candidate_store

router = APIRouter(tags=["feedback"])


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    if candidate_store.get_candidate(request.candidate_id) is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    try:
        await cognee_client.remember_interaction(
            candidate_id=request.candidate_id,
            action=request.action.value,
            recruiter_id=request.recruiter_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {e}")

    return FeedbackResponse(
        status="ok",
        message=f"Recorded '{request.action.value}' for candidate {request.candidate_id}",
    )
