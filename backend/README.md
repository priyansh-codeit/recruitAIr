# MemoryHire Backend

FastAPI backend for the MemoryHire hackathon project. Handles resume upload, natural
language candidate search, candidate comparison, and recruiter feedback (the signal that
powers Cognee's "Improve" step).

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in keys once teammates' modules need them
uvicorn main:app --reload
```

Then open **http://127.0.0.1:8000/docs** — interactive Swagger UI to test every endpoint
without needing the frontend running.

## Endpoints

| Method | Path        | Purpose                                              |
|--------|-------------|-------------------------------------------------------|
| POST   | `/upload`   | Upload a resume PDF → parsed + stored                |
| POST   | `/search`   | Natural language query → ranked candidates            |
| POST   | `/compare`  | Compare two candidates → explanation                  |
| POST   | `/feedback` | Record recruiter action (shortlist/reject/etc.)       |

## Architecture / where things live

```
app/
├── models.py              # shared Pydantic models (the contract)
├── routers/                # one file per endpoint, thin — just orchestration
├── services/
│   ├── cognee_client.py    # wraps Gautam's Cognee module (currently mocked)
│   └── llm_client.py       # wraps AI lead's parsing/ranking module (currently mocked)
└── storage/
    ├── candidate_store.py  # backend's own structured candidate data (full Candidate objects)
    └── mock_data.py         # fake data used until real modules are wired in
```

### Why there's a `candidate_store.py` separate from Cognee

Cognee's `search_candidates()` only returns semantic matches — `candidate_id`, `score`,
and a `reason` string. It does **not** return full structured candidate data (name,
skills, experience, etc). So the backend keeps its own lightweight store of full
`Candidate` objects, populated at upload time (right after parsing), and the `/search`
endpoint joins Cognee's matches against that store to build the final `CandidateResult`
sent to the frontend.

## Swapping in real teammate modules

Both `app/services/cognee_client.py` and `app/services/llm_client.py` currently return
mock data so the rest of the backend works end-to-end without waiting on anyone. Each
function has a `# TODO: replace with real ... call from teammate` comment.

To wire in real code:
1. Import the teammate's module at the top of the relevant `*_client.py` file.
2. Replace the mock fallback in each function with the real call.
3. Flip `USE_REAL_COGNEE` / `USE_REAL_LLM` to `True`.

No changes are needed in `routers/` or `main.py` — they only ever call the functions in
`services/`, never the real modules directly.

## Finalized interfaces

**Cognee module (Gautam):**
```python
await remember_resume(candidate_id: str, resume_text: str) -> None
results = await search_candidates(query: str, top_k: int = 10) -> list[CogneeMatch]
await delete_all_candidates() -> None
await improve_memory() -> None
await remember_interaction(candidate_id: str, action: str, recruiter_id: str = "default") -> None
```

**LLM module (AI lead):**
```python
candidate = await parse_resume(resume_text: str, candidate_id: str, source_filename: str = None) -> Candidate
explanation = await explain_comparison(candidate_a: Candidate, candidate_b: Candidate) -> str
```
