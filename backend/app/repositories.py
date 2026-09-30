from datetime import UTC, datetime, timedelta

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models import Article, article_document


class ArticleRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.articles

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("url", unique=True)
        await self.collection.create_index("normalized_title", unique=True)
        await self.collection.create_index([("published_at", -1)])
        await self.collection.create_index([("analysis.sentiment.label", 1), ("published_at", -1)])
        await self.collection.create_index([("title", "text"), ("content", "text")])

    async def insert_if_new(self, article: Article) -> bool:
        try:
            await self.collection.insert_one(article_document(article))
            return True
        except Exception as exc:
            if "duplicate" in str(exc).lower():
                return False
            raise

    async def claim_pending(self) -> dict | None:
        return await self.collection.find_one_and_update(
            {"processed_at": None, "processing_started_at": None},
            {"$set": {"processing_started_at": datetime.now(UTC)}, "$inc": {"processing_attempts": 1}},
            sort=[("published_at", -1)], return_document=ReturnDocument.AFTER,
        )

    async def mark_processed(self, article_id: object, analysis: dict) -> None:
        await self.collection.update_one(
            {"_id": article_id},
            {"$set": {"analysis": analysis, "processed_at": datetime.now(UTC), "processing_error": None}},
        )

    async def mark_failed(self, article_id: object, message: str) -> None:
        await self.collection.update_one({"_id": article_id}, {"$set": {"processing_error": message, "processing_started_at": None}})

    async def latest(self, limit: int = 10, sentiment: str | None = None, sources: list[str] | None = None) -> list[dict]:
        query = {"processed_at": {"$ne": None}}
        if sentiment:
            query["analysis.sentiment.label"] = sentiment
        if sources:
            query["source"] = {"$in": sources}
        return await self.collection.find(query).sort("published_at", -1).limit(limit).to_list(length=limit)

    async def delete_expired_articles(self) -> int:
        result = await self.collection.delete_many({"created_at": {"$lt": datetime.now(UTC) - timedelta(hours=24)}})
        return result.deleted_count

    async def by_id(self, article_id: str) -> dict | None:
        return await self.collection.find_one({"_id": article_id})


