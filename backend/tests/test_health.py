from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    response = TestClient(app).get("/api/healthz")
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_legacy_health_alias() -> None:
    response = TestClient(app).get("/api/health")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"
