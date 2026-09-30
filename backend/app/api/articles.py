from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db import database_dependency
from app.auth import current_user
from app.cache import get_json, set_json
from app.repositories import ArticleRepository

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("/feed")
async def feed(
    sentiment: str | None = Query(default=None),
    sources: list[str] | None = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(database_dependency),
    _: dict = Depends(current_user),
) -> dict:
    source_key = ",".join(sorted(sources or []))
    key = f"brief:v1:feed:{sentiment or 'all'}:{source_key}"
    cached = await get_json(key)
    if cached is not None: return cached
    articles = await ArticleRepository(db).latest(sentiment=sentiment, sources=sources)
    for article in articles:
        article["_id"] = str(article["_id"])
    result = {"success": True, "data": {"articles": articles, "total": len(articles)}, "articles": articles, "total": len(articles)}
    await set_json(key, result, 300)
    return result

@router.get("/last-enriched")
async def last_enriched(db: AsyncIOMotorDatabase = Depends(database_dependency), _: dict = Depends(current_user)) -> dict:
    metrics = await db.system_metrics.find_one({"_id": "processing"})
    return {"success": True, "lastEnrichedAt": metrics.get("last_run_at") if metrics else None}

@router.get("/{article_id}")
async def detail(article_id: str, db: AsyncIOMotorDatabase = Depends(database_dependency), _: dict = Depends(current_user)) -> dict:
    article = await ArticleRepository(db).by_id(article_id)
    if not article: raise HTTPException(status_code=404, detail="Article not found")
    article["_id"] = str(article["_id"])
    return {"success": True, "data": {"article": article}}
