from typing import Literal

from pydantic import BaseModel, Field

SentimentLabel = Literal["Very Bullish", "Bullish", "Neutral", "Bearish", "Very Bearish"]


class Sentiment(BaseModel):
    label: SentimentLabel
    confidence: float = Field(ge=0, le=1)


class Entities(BaseModel):
    companies: list[str] = Field(default_factory=list)
    people: list[str] = Field(default_factory=list)
    countries: list[str] = Field(default_factory=list)
    tickers: list[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    key_points: list[str] = Field(min_length=3, max_length=5)
    actionable_insight: str = Field(min_length=1)
    rating_explanation: str = Field(min_length=1)
    sentiment: Sentiment
    topics: list[str] = Field(default_factory=list)
    entities: Entities = Field(default_factory=Entities)
