import os
import fitz
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
