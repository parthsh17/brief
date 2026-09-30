import logging
from datetime import UTC, datetime

from app.db import database
from app.models import Article
from app.repositories import ArticleRepository
from app.services.ai import analyze
from app.services.rss import FEED_STATUS, fetch_all
from app.cache import delete_pattern

logger = logging.getLogger(__name__)


async def ingest_once() -> int:
    repository = ArticleRepository(database())
    await repository.ensure_indexes()
    inserted = 0
    for raw in (await fetch_all())[:10]:
        if not raw.get("url"):
            continue
        if await repository.insert_if_new(Article(**raw)):
            inserted += 1
    await database().system_metrics.update_one({"_id": "ingestion"}, {"$inc": {"runs": 1, "articles_inserted": inserted}, "$set": {"last_run_at": datetime.now(UTC), "feed_status": FEED_STATUS}}, upsert=True)
    if inserted:
        await delete_pattern("brief:v1:feed:*")
    return inserted


async def process_once(limit: int = 10) -> int:
    repository = ArticleRepository(database())
    processed = 0
    for _ in range(limit):
        article = await repository.claim_pending()
        if not article:
            break
        try:
            result, usage = await analyze(article["title"], article.get("content", ""))
            await repository.mark_processed(article["_id"], result.model_dump())
            await database().system_metrics.update_one({"_id": "processing"}, {"$inc": {"prompt_tokens": usage["prompt_tokens"], "completion_tokens": usage["completion_tokens"], "total_tokens": usage["total_tokens"]}}, upsert=True)
            await delete_pattern("brief:v1:feed:*")
            processed += 1
        except Exception as exc:
            await repository.mark_failed(article["_id"], str(exc)[:500])
            logger.exception("article_processing_failed", extra={"article_id": str(article["_id"])})
    await database().system_metrics.update_one({"_id": "processing"}, {"$inc": {"runs": 1, "articles_processed": processed}, "$set": {"last_run_at": datetime.now(UTC)}}, upsert=True)
    return processed


async def cleanup_expired_articles() -> None:
    deleted = await ArticleRepository(database()).delete_expired_articles()
    await database().system_metrics.update_one({"_id": "cleanup"}, {"$inc": {"articles_deleted": deleted}, "$set": {"last_run_at": datetime.now(UTC)}}, upsert=True)
    if deleted:
        await delete_pattern("brief:v1:feed:*")
