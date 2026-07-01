import cognee

async def delete_all_candidates():
    """
    Delete every stored candidate.
    """
    await cognee.forget(everything=True)