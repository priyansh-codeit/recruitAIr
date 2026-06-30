import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load backend/.env
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL")


if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found.")

if not MODEL:
    raise ValueError("GEMINI_MODEL not found.")

client = genai.Client(api_key=API_KEY)


class AIClient:
    def generate(self, prompt: str) -> str:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        return response.text


ai = AIClient()