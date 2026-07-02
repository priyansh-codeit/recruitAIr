import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.cognee.interaction import remember_interaction
from app.cognee.recall import search_candidates as cognee_search_candidates
from app.cognee.improve import improve_memory
from app.cognee.forget import delete_all_candidates
from .schemas import UploadResponse, SearchRequest, SearchResponse, CandidateNode
from .utils import (
    extract_text_from_pdf,
    build_candidate_summary,
    store_candidate_memory,
    UPLOAD_DIR,
)

load_dotenv()

app = FastAPI(
    title='RecruitAIr API',
    description='Backend for RecruitAIr with resume ingestion, candidate memory, and search.',
    version='0.1.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

MOCK_CANDIDATES = []

@app.get('/')
async def root():
    return {'success': True, 'message': 'RecruitAIr backend is running.'}

@app.post('/upload', response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail='Only PDF files are accepted.')

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f'{file_id}.pdf')

    with open(file_path, 'wb') as buffer:
        buffer.write(await file.read())

    text = extract_text_from_pdf(file_path)
    summary = build_candidate_summary(text)

    candidate_data = {
        'id': file_id,
        'name': 'Unknown Candidate',
        'role': 'Parsed Resume',
        'skills': ['Parsed', 'Resume'],
        'summary': summary,
        'match_score': 75,
        'reasoning': 'Extracted resume text and stored candidate context.',
        'matched_nodes': ['Resume_Text', 'Parsed_Skills'],
    }

    candidate = CandidateNode(**candidate_data)
    MOCK_CANDIDATES.append(candidate)

    memory_saved = await store_candidate_memory(candidate_data)
    if not memory_saved:
        candidate.reasoning += ' Cognee storage failed or is not configured.'

    return UploadResponse(success=True, message='Resume uploaded successfully.', candidate=candidate)

@app.post('/search', response_model=SearchResponse)
async def search_candidates(request: SearchRequest):
    try:
        cognee_results = await cognee_search_candidates(request.query)

        # For now, return Cognee's raw results if available.
        # We'll map them to CandidateNode objects later.
        if cognee_results:
            formatted_results = []

            for i, result in enumerate(cognee_results):
                formatted_results.append(
                CandidateNode(
                    id=f"cognee-{i}",
                    name="Cognee Match",
                    role="Retrieved Memory",
                    skills=[],
                    summary=result.text,
                    match_score=100,
                    reasoning="Retrieved from Cognee memory.",
                    matched_nodes=[result.source],
                )
            )

            return SearchResponse(
            success=True,
            results=formatted_results,
        )
    except Exception as e:
        print(f"Cognee search failed: {e}")

    # Fallback to existing mock search
    query = request.query.lower()
    results = []

    for candidate in MOCK_CANDIDATES:
        if (
            query in candidate.summary.lower()
            or query in candidate.role.lower()
            or any(query in skill.lower() for skill in candidate.skills)
        ):
            results.append(candidate)

    return SearchResponse(success=True, results=results)

@app.get('/candidates', response_model=SearchResponse)
async def list_candidates():
    return SearchResponse(success=True, results=MOCK_CANDIDATES)

@app.post("/feedback")
async def feedback(
    candidate_id: str,
    action: str,
    recruiter_id: str = "default",
):
    await remember_interaction(
        candidate_id=candidate_id,
        action=action,
        recruiter_id=recruiter_id,
    )

    return {
        "success": True,
        "message": f"Recorded '{action}' for candidate {candidate_id}",
    }
@app.post("/improve")
async def improve():
    await improve_memory()

    return {
        "success": True,
        "message": "Cognee memory improved successfully.",
    }
@app.post("/forget")
async def forget():
    await delete_all_candidates()

    return {
        "success": True,
        "message": "All candidate memories deleted successfully.",
    }