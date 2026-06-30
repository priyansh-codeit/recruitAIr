from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import upload, search, compare, feedback

load_dotenv()

app = FastAPI(
    title="RecruitAIr Backend",
    description="AI recruiter assistant — backend API (upload, search, compare, feedback)",
    version="0.1.0",
)

# Hackathon-friendly: allow all origins. Tighten this if you have time later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(feedback.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "MemoryHire backend is running. See /docs for API."}
