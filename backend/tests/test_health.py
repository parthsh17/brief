import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api import health as health_api


@pytest.fixture
def mock_redis(monkeypatch):
    async def ping():
        return True

    monkeypatch.setattr(health_api.redis, "ping", ping)


def test_health(mock_redis) -> None:
    response = TestClient(app).get("/api/healthz")
    assert response.status_code == 200
    assert response.json()["success"] is True
