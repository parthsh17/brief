from datetime import UTC, datetime

from fastapi import APIRouter
from app.core.config import get_settings
from app.db import client
from app.cache import redis

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def health() -> dict[str, object]:
    checks: dict[str, str] = {"groq": "configured" if get_settings().groq_api_key else "not_configured", "scheduler": "available"}
    if client:
        try: await client.admin.command("ping"); checks["mongodb"] = "ok"
        except Exception: checks["mongodb"] = "unavailable"
    else: checks["mongodb"] = "not_connected"
    try: await redis.ping(); checks["redis"] = "ok"
    except Exception: checks["redis"] = "unavailable"
    return {
        "success": True, "data": {"status": "ok", "timestamp": datetime.now(UTC).isoformat(), "checks": checks},
    }
