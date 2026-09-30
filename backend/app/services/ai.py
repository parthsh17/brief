import json

from groq import AsyncGroq

from app.core.config import get_settings
from app.schemas.analysis import AnalysisResult

SYSTEM_PROMPT = """You analyze financial news. Return only JSON matching: {key_points: string[3-5],  actionable_insight: string, rating_explanation: string, sentiment: {label: Very Bullish|Bullish|Neutral|Bearish|Very Bearish, confidence: number 0-1}, topics: string[], entities: {companies: string[], people: string[], countries: string[], tickers: string[]}}. The rating_explanation must briefly explain which facts in the article caused the sentiment rating and confidence. The actionable_insight must be a concise, practical market implication grounded only in the supplied article. Use only the supplied article."""


async def analyze(title: str, content: str) -> tuple[AnalysisResult, dict[str, int]]:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    client = AsyncGroq(api_key=settings.groq_api_key)
    response = await client.chat.completions.create(
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"},
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
                  {"role": "user", "content": f"Title: {title}\nArticle: {content[:4000]}"}],
    )
    usage = response.usage
    tokens = {
        "prompt_tokens": int(getattr(usage, "prompt_tokens", 0) or 0),
        "completion_tokens": int(getattr(usage, "completion_tokens", 0) or 0),
        "total_tokens": int(getattr(usage, "total_tokens", 0) or 0),
    }
    return AnalysisResult.model_validate(json.loads(response.choices[0].message.content or "{}")), tokens
