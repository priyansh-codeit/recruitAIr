import cognee

async def remember_resume(candidate_id: str, resume_text: str):
    """
    Store candidate resume in Cognee.
    Candidate ID is embedded so it can be retrieved later.
    """

    memory = f"""
    CANDIDATE_ID: {candidate_id}

    {resume_text}
    """

    await cognee.remember(memory)