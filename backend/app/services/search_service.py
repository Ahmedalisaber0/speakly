from duckduckgo_search import DDGS


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """General web search using DuckDuckGo."""
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    return [
        {
            "title": r.get("title", ""),
            "url": r.get("href", ""),
            "body": r.get("body", ""),
            "source": r.get("href", "").split("/")[2] if r.get("href") else "",
            "image": "",
            "date": "",
        }
        for r in results
    ]


async def search_news(query: str, max_results: int = 5) -> list[dict]:
    """Search for news articles using DuckDuckGo."""
    with DDGS() as ddgs:
        results = list(ddgs.news(query, max_results=max_results))
    return [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "body": r.get("body", ""),
            "source": r.get("source", ""),
            "image": r.get("image", ""),
            "date": r.get("date", ""),
        }
        for r in results
    ]
