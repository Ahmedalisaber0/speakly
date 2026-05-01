import asyncio
import logging

try:
    from ddgs import DDGS  # maintained successor to duckduckgo_search
except ImportError:  # fallback for old envs
    from duckduckgo_search import DDGS  # type: ignore

logger = logging.getLogger(__name__)


async def _ddg_call(method_name: str, query: str, max_results: int) -> list[dict]:
    """Run a DDGS call in a worker thread with simple retry on rate limit."""

    def _do_call() -> list[dict]:
        with DDGS() as ddgs:
            method = getattr(ddgs, method_name)
            return list(method(query, max_results=max_results))

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            return await asyncio.to_thread(_do_call)
        except Exception as e:  # noqa: BLE001 - DDG raises various error types
            last_error = e
            msg = str(e).lower()
            if "ratelimit" in msg or "403" in msg:
                if attempt < 2:
                    await asyncio.sleep(1.0 * (attempt + 1))
                    continue
                logger.warning("DDG rate-limited after retries: %s", e)
                return []
            logger.error("DDG search failed: %s", e)
            return []
    if last_error:
        logger.error("DDG exhausted retries: %s", last_error)
    return []


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """General web search using DuckDuckGo."""
    results = await _ddg_call("text", query, max_results)
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
    results = await _ddg_call("news", query, max_results)
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
