import os
import fitz
import requests
from dotenv import load_dotenv

load_dotenv()

COGNEE_API_KEY = os.getenv('COGNEE_API_KEY')
COGNEE_ENDPOINT = os.getenv('COGNEE_ENDPOINT')
HF_TOKEN = os.getenv('HF_TOKEN')
HF_MODEL = os.getenv('HF_MODEL', 'mistralai/Mistral-7B-Instruct-v0.3')

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')

os.makedirs(UPLOAD_DIR, exist_ok=True)


def extract_text_from_pdf(file_path: str) -> str:
    document = fitz.open(file_path)
    text = []
    for page in document:
        text.append(page.get_text())
    document.close()
    return '\n'.join(text)


def build_candidate_summary(text: str) -> str:
    return text[:1200].replace('\n', ' ')


def _send_candidate_to_cognee(url: str, payload: dict, headers: dict) -> bool:
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False


def store_candidate_memory(candidate: dict) -> bool:
    if not COGNEE_API_KEY or not COGNEE_ENDPOINT:
        return False

    headers = {
        'Authorization': f'Bearer {COGNEE_API_KEY}',
        'Content-Type': 'application/json',
    }

    payload = {
        'candidate': candidate,
        'metadata': {
            'source': 'RecruitAIr',
            'candidate_id': candidate.get('id'),
        },
    }

    endpoint_paths = ['memory', 'v1/memory', 'records', 'v1/records']
    base_url = COGNEE_ENDPOINT.rstrip('/')

    for path in endpoint_paths:
        url = f"{base_url}/{path}"
        if _send_candidate_to_cognee(url, payload, headers):
            return True

    return False
