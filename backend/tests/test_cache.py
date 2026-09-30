import pytest

from app import cache


@pytest.mark.asyncio
async def test_cache_unavailability_is_a_cache_miss(monkeypatch):
    async def fail(*_args, **_kwargs): raise RuntimeError("redis unavailable")
    monkeypatch.setattr(cache.redis, "get", fail)
    assert await cache.get_json("brief:test") is None


@pytest.mark.asyncio
async def test_cache_set_unavailability_does_not_fail(monkeypatch):
    async def fail(*_args, **_kwargs): raise RuntimeError("redis unavailable")
    monkeypatch.setattr(cache.redis, "set", fail)
    await cache.set_json("brief:test", {"ok": True}, 10)
