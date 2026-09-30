import json
from typing import Any

from redis.asyncio import Redis

from app.core.config import get_settings

redis = Redis.from_url(
    get_settings().redis_url,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)


async def get_json(key: str) -> Any | None:
    try:
        value = await redis.get(key)
        return json.loads(value) if value else None
    except Exception:
        return None


async def set_json(key: str, value: Any, ttl: int) -> None:
    try:
        await redis.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:
        pass

async def delete_pattern(pattern: str) -> None:
    try:
        keys = [key async for key in redis.scan_iter(match=pattern)]
        if keys:
            await redis.delete(*keys)
    except Exception:
        pass
