import cognee

async def search_candidates(
    query: str,
    top_k: int = 10
):
    results = await cognee.recall(query_text=query)

    return results[:top_k]