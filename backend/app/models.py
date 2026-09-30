from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, HttpUrl

from app.schemas.analysis import AnalysisResult


class Article(BaseModel):
    id: str | None = Field(default=None, alias="_id")
    title: str
    content: str = ""
    source: str
    url: HttpUrl
    normalized_title: str
    published_at: datetime
    processed_at: datetime | None = None
    processing_started_at: datetime | None = None
    processing_error: str | None = None
    processing_attempts: int = 0
    analysis: AnalysisResult | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


def article_document(article: Article) -> dict[str, Any]:
    data = article.model_dump(by_alias=True, mode="json", exclude_none=True)
    data.pop("_id", None)
    return data
