import asyncio
import re
from datetime import UTC, datetime

import feedparser
import httpx

from app.sources import SOURCE_FEEDS
FEEDS = SOURCE_FEEDS
FEED_STATUS: dict[str, dict] = {}


def normalize_title(title: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", title.lower()).strip()


async def fetch_feed(source: str, url: str) -> list[dict]:
    last_error = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=12) as client:
                response = await client.get(url, headers={"User-Agent": "brief-news-bot/1.0"})
                response.raise_for_status()
            FEED_STATUS[source] = {"status": "ok", "articles": len(response.text), "last_error": None, "last_fetched_at": datetime.now(UTC)}
            break
        except Exception as exc:
            last_error = exc
            FEED_STATUS[source] = {"status": "failed", "articles": 0, "last_error": str(exc)[:300], "last_fetched_at": datetime.now(UTC)}
            if attempt == 2: raise
            await asyncio.sleep(2 ** attempt)
    parsed = await asyncio.to_thread(feedparser.parse, response.text)
    result = []
    for item in parsed.entries:
        title = (item.get("title") or "Untitled").strip()
        result.append({"title": title, "content": item.get("summary", ""), "source": source,
                       "url": item.get("link") or item.get("id"),
                       "normalized_title": normalize_title(title),
                       "published_at": datetime.now(UTC)})
    return result


async def fetch_all() -> list[dict]:
    results = await asyncio.gather(*(fetch_feed(name, url) for name, url in FEEDS.items()), return_exceptions=True)
    return [article for result in results if isinstance(result, list) for article in result]
