import json

from app.parser.resume_parser import extract_text
from app.llm.client import ai
from app.llm.prompts import resume_prompt

pdf_path = "sample_resume.pdf"

text = extract_text(pdf_path)

response = ai.generate(
    resume_prompt(text)
)

# Save the raw JSON response
with open("sample_output.json", "w", encoding="utf-8") as f:
    f.write(response)

# Convert JSON string into Python dictionary
candidate = json.loads(response)

print(candidate)