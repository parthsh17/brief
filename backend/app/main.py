from contextlib import asynccontextmanager
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.observability import RequestMetricsMiddleware

from app.api.articles import router as articles_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.health import router as health_router
from app.core.config import get_settings
from app.db import connect, disconnect
from app.workers import cleanup_expired_articles, ingest_once, process_once

scheduler = AsyncIOScheduler()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

@asynccontextmanager
async def lifespan(_: FastAPI):
    if get_settings().testing:
        yield
        return
    await connect()
    scheduler.add_job(ingest_once, "interval", hours=1, id="rss-ingestion", replace_existing=True)
    scheduler.add_job(process_once, "interval", hours=2, id="article-processing", replace_existing=True)
    scheduler.add_job(cleanup_expired_articles, "interval", hours=1, id="article-cleanup", replace_existing=True)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)
    await disconnect()


app = FastAPI(title="Brief API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=get_settings().allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(SessionMiddleware, secret_key=get_settings().session_secret)
app.add_middleware(RequestMetricsMiddleware)
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(articles_router, prefix="/api")

