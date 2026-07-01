import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .schemas import UploadResponse, SearchRequest, SearchResponse, CandidateNode
from .utils import extract_text_from_pdf, build_candidate_summary, UPLOAD_DIR

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

    candidate = CandidateNode(
        id=file_id,
        name='Unknown Candidate',
        role='Parsed Resume',
        skills=['Parsed', 'Resume'],
        summary=summary,
        match_score=75,
        reasoning='Extracted resume text and stored candidate context. Cognee integration pending.',
        matched_nodes=['Resume_Text', 'Parsed_Skills'],
    )

    MOCK_CANDIDATES.append(candidate)

    return UploadResponse(success=True, message='Resume uploaded successfully.', candidate=candidate)

@app.post('/search', response_model=SearchResponse)
async def search_candidates(request: SearchRequest):
    query = request.query.lower()
    results = []

    for candidate in MOCK_CANDIDATES:
        if query in candidate.summary.lower() or query in candidate.role.lower() or any(query in skill.lower() for skill in candidate.skills):
            results.append(candidate)

    return SearchResponse(success=True, results=results)

@app.get('/candidates', response_model=SearchResponse)
async def list_candidates():
    return SearchResponse(success=True, results=MOCK_CANDIDATES)
