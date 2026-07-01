def resume_prompt(resume_text: str) -> str:
    return f"""
You are an expert ATS resume parser.

Extract ALL useful information from the following resume.

Return ONLY valid JSON.

Use this structure:

{{
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "location": "",

    "summary": "",

    "skills": [],

    "education": [],

    "experience": [],

    "projects": [],

    "certifications": [],

    "achievements": [],

    "languages": [],

    "years_of_experience": 0
}}

Resume:

{resume_text}
"""