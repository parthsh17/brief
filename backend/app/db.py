from collections.abc import AsyncIterator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

client: AsyncIOMotorClient | None = None


async def connect() -> None:
    global client
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")


async def disconnect() -> None:
    if client:
        client.close()


def database() -> AsyncIOMotorDatabase:
    if client is None:
        raise RuntimeError("Database is not connected")
    return client[get_settings().mongodb_database]


async def database_dependency() -> AsyncIterator[AsyncIOMotorDatabase]:
    yield database()
