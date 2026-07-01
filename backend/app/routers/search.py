"""
POST /search — recruiter searches with a natural language query.

Flow:
  1. Send query to Cognee -> get back CogneeMatch list (candidate_id, score, reason) ONLY
  2. Look up full structured Candidate data from our own candidate_store using those IDs
  3. Merge the two into CandidateResult objects for the frontend
"""

from fastapi import APIRouter, HTTPException

from app.models import SearchRequest, SearchResponse, CandidateResult
from app.services import cognee_client
from app.storage import candidate_store

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search_candidates(request: SearchRequest):
    try:
        matches = await cognee_client.search_candidates(query=request.query, top_k=request.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")

    results = []
    for match in matches:
        candidate = candidate_store.get_candidate(match.candidate_id)
        if candidate is None:
            # Cognee knows about a candidate we don't have structured data for (e.g. stale memory).
            # Skip it rather than returning a broken/partial result to the frontend.
            continue

        results.append(
            CandidateResult(
                id=candidate.id,
                name=candidate.name,
                skills=candidate.skills,
                experience_years=candidate.experience_years,
                score=match.score,
                reason=match.reason,
                email=candidate.email,
                source_filename=candidate.source_filename,
            )
        )

    return SearchResponse(query=request.query, results=results)
