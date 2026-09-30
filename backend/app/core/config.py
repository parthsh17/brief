from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Brief API"
    environment: str = "development"
    testing: bool = False
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "brief"
    redis_url: str = "redis://localhost:6379/0"
    groq_api_key: str = ""
    session_secret: str = "change-me-in-production"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_callback_url: str = "http://localhost:8000/api/auth/google/callback"
    client_url: str = "http://localhost:5173"

    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
