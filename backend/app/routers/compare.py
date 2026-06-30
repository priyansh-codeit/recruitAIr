"""
POST /compare — "Why is Candidate A ranked above Candidate B?"

Flow:
  1. Look up both candidates from candidate_store
  2. Call llm_client.explain_comparison() for the reasoning text
  3. Return both full candidates + explanation
"""

from fastapi import APIRouter, HTTPException

from app.models import CompareRequest, CompareResponse
from app.services import llm_client
from app.storage import candidate_store

router = APIRouter(tags=["compare"])


@router.post("/compare", response_model=CompareResponse)
async def compare_candidates(request: CompareRequest):
    candidate_a = candidate_store.get_candidate(request.candidate_id_a)
    candidate_b = candidate_store.get_candidate(request.candidate_id_b)

    if candidate_a is None or candidate_b is None:
        raise HTTPException(status_code=404, detail="One or both candidates not found")

    try:
        explanation = await llm_client.explain_comparison(candidate_a, candidate_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {e}")

    return CompareResponse(
        candidate_a=candidate_a,
        candidate_b=candidate_b,
        winner_id=None,  # leave ranking decision to the AI lead's logic if/when they add it
        explanation=explanation,
    )
