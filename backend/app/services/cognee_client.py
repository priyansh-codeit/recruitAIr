"""
Thin wrapper around Gautam's Cognee memory module.

FINAL AGREED INTERFACE (do not change without telling Gautam):

    await remember_resume(candidate_id: str, resume_text: str) -> None
    results = await search_candidates(query: str, top_k: int = 10) -> list[CogneeMatch]
    await delete_all_candidates() -> None
    await improve_memory() -> None
    await remember_interaction(candidate_id: str, action: str, recruiter_id: str = "default") -> None

IMPORTANT: search_candidates() returns CogneeMatch (candidate_id, score, reason) ONLY —
NOT full candidate data. Cognee does semantic recall; the backend's candidate_store.py
holds the full structured Candidate objects. The /search router joins the two.

Replace the bodies of these functions with real calls into Gautam's module once it's
ready to import, e.g.:
    from cognee_module import cognee_client as real_cognee

Until then, each function falls back to mock data so the rest of the backend can be
built and tested independently.
"""

from typing import List
from app.models import CogneeMatch
from app.storage.mock_data import mock_search_matches
from app.cognee.remember import remember_resume as real_remember_resume
from app.cognee.forget import delete_all_candidates as real_delete_all_candidates
from app.cognee.improve import improve_memory as real_improve_memory
from app.cognee.interaction import remember_interaction as real_remember_interaction

# TODO: once Gautam's module is ready, import it here, e.g.:
# import cognee_memory  (or whatever package/module name he gives you)

 # flip to True once Gautam's module is wired in


async def remember_resume(candidate_id: str, resume_text: str) -> None:
    await real_remember_resume(candidate_id, resume_text)

async def search_candidates(query: str, top_k: int = 10) -> List[CogneeMatch]:
    # TODO: replace with real Cognee module call from teammate
    # e.g. return await cognee_memory.search_candidates(query, top_k)
    if USE_REAL_COGNEE:
        raise NotImplementedError("Wire in Gautam's real search_candidates() here")
    return mock_search_matches(query, top_k)


async def delete_all_candidates() -> None:
    await real_delete_all_candidates()


async def improve_memory() -> None:
    await real_improve_memory()


async def remember_interaction(
    candidate_id: str,
    action: str,
    recruiter_id: str = "default"
) -> None:
    await real_remember_interaction(
        candidate_id,
        action,
        recruiter_id
    )
