import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.db import database

logger = logging.getLogger("brief.http")

class RequestMetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        started = time.perf_counter()
        try:
            response = await call_next(request)
            response.headers["x-request-id"] = request_id
            return response
        finally:
            duration_ms = round((time.perf_counter() - started) * 1000, 2)
            logger.info("http_request", extra={"request_id": request_id, "method": request.method, "path": request.url.path, "duration_ms": duration_ms})
            try:
                await database().api_metrics.update_one({"_id": request.url.path}, {"$inc": {"requests": 1}, "$set": {"last_request_at": time.time()}}, upsert=True)
            except Exception:
                pass
