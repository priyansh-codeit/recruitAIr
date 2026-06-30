"""
Backend-owned structured candidate store.

Why this exists: Cognee's recall() only returns semantic matches (candidate_id, score, reason),
not full structured candidate data. So the backend keeps its own store of full Candidate objects,
populated at upload time, and joins it against Cognee's recall results during /search.

Hackathon-simple: a plain Python dict, process-memory only (resets on restart).
If you have time later, swap this for a JSON file or SQLite without changing the function
signatures below — nothing else in the codebase needs to change.
"""

from typing import Dict, Optional, List
from app.models import Candidate

_candidates: Dict[str, Candidate] = {}


def save_candidate(candidate: Candidate) -> None:
    _candidates[candidate.id] = candidate


def get_candidate(candidate_id: str) -> Optional[Candidate]:
    return _candidates.get(candidate_id)


def get_candidates(candidate_ids: List[str]) -> List[Candidate]:
    """Look up multiple candidates, skipping any that aren't found."""
    return [_candidates[cid] for cid in candidate_ids if cid in _candidates]


def get_all_candidates() -> List[Candidate]:
    return list(_candidates.values())


def clear_all() -> None:
    _candidates.clear()
