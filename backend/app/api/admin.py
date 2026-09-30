from datetime import UTC, datetime, timedelta
from fastapi import APIRouter, Depends
from app.auth import current_user
from app.db import database
from app.sources import SOURCE_FEEDS
from app.services.rss import FEED_STATUS

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/metrics")
async def metrics(_: dict = Depends(current_user)) -> dict:
    db = database()
    total = await db.articles.count_documents({})
    processed = await db.articles.count_documents({"processed_at": {"$ne": None}})
    failures = await db.articles.count_documents({"processing_error": {"$exists": True, "$nin": [None, ""]}})
    ingestion = await db.system_metrics.find_one({"_id": "ingestion"}) or {}
    processing = await db.system_metrics.find_one({"_id": "processing"}) or {}
    api_rows = await db.api_metrics.find({}).to_list(100)
    api_calls = sum(row.get("requests", 0) for row in api_rows)
    cleanup = await db.system_metrics.find_one({"_id": "cleanup"}) or {}
    source_counts = await db.articles.aggregate([{"$group": {"_id": "$source", "fetched": {"$sum": 1}, "processed": {"$sum": {"$cond": [{"$ne": ["$processed_at", None]}, 1, 0]}}}}]).to_list(None)
    counts = {row["_id"]: row for row in source_counts}
    sources = [{"name": name, "status": FEED_STATUS.get(name, {}).get("status", "not fetched"), "articles_fetched": counts.get(name, {}).get("fetched", 0), "articles_processed": counts.get(name, {}).get("processed", 0), "last_fetched_at": FEED_STATUS.get(name, {}).get("last_fetched_at"), "last_error": FEED_STATUS.get(name, {}).get("last_error")} for name in SOURCE_FEEDS]
    return {"success": True, "data": {"total_articles": total, "total_processed_articles": processed, "total_sources": len(SOURCE_FEEDS), "last_fetched_at": ingestion.get("last_run_at"), "last_processed_at": processing.get("last_run_at"), "api_calls": api_calls, "total_tokens_spent": processing.get("total_tokens", 0), "processing_failures": failures, "processing_success_rate": round(processed / max(processed + failures, 1) * 100, 2), "articles_processed_24h": await db.articles.count_documents({"processed_at": {"$gte": datetime.now(UTC) - timedelta(hours=24)}}), "articles_pending": await db.articles.count_documents({"processed_at": None}), "articles_deleted": cleanup.get("articles_deleted", 0), "sources": sources}}
