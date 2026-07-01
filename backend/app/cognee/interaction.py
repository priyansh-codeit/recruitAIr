import cognee

VALID_ACTIONS = {
    "viewed",
    "shortlisted",
    "rejected",
    "interviewed",
    "hired",
    "downloaded",
    "compared",
}

async def remember_interaction(
    candidate_id: str,
    action: str,
    recruiter_id: str = "default"
):
    if action not in VALID_ACTIONS:
        raise ValueError(f"Invalid action: {action}")

    interaction = f"""
    Recruiter: {recruiter_id}
    Candidate: {candidate_id}
    Action: {action}
    """

    await cognee.remember(interaction)