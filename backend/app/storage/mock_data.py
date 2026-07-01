"""
Fake data used by service stubs until real Cognee/LLM modules are fully wired in.
Delete or stop importing this once cognee_client.py and llm_client.py call the real modules.
"""

from app.models import Candidate, CogneeMatch

MOCK_CANDIDATES = [
    Candidate(
        id="mock-1",
        name="Rahul Sharma",
        email="rahul.sharma@example.com",
        skills=["Python", "FastAPI", "AWS", "Docker"],
        experience_years=2.5,
        education="Tier 2 Engineering College",
        internships=2,
        projects=["Job board scraper", "Realtime chat app"],
        certifications=[],
        links=["github.com/rahulsharma"],
        source_filename="rahul_resume.pdf",
    ),
    Candidate(
        id="mock-2",
        name="Ananya Verma",
        email="ananya.verma@example.com",
        skills=["Java", "Spring Boot", "Kubernetes"],
        experience_years=4.0,
        education="IIT",
        internships=0,
        projects=["Competitive programming portfolio"],
        certifications=["AWS Solutions Architect"],
        links=["github.com/ananyav"],
        source_filename="ananya_resume.pdf",
    ),
    Candidate(
        id="mock-3",
        name="Karthik Iyer",
        email="karthik.iyer@example.com",
        skills=["React", "Node.js", "MongoDB"],
        experience_years=1.0,
        education="State University",
        internships=3,
        projects=["Startup MVP - food delivery app", "Personal portfolio site"],
        certifications=[],
        links=["github.com/karthiki", "linkedin.com/in/karthiki"],
        source_filename="karthik_resume.pdf",
    ),
]


def mock_search_matches(query: str, top_k: int = 10) -> list[CogneeMatch]:
    """Pretend semantic search — just returns all mock candidates with fake scores."""
    matches = [
        CogneeMatch(candidate_id="mock-1", score=0.91, reason="Strong FastAPI and AWS experience, 2 internships"),
        CogneeMatch(candidate_id="mock-3", score=0.78, reason="Startup experience and relevant backend projects"),
        CogneeMatch(candidate_id="mock-2", score=0.55, reason="Strong CS fundamentals but less backend-specific experience"),
    ]
    return matches[:top_k]
