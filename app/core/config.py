from functools import lru_cache
from typing import List

from pydantic import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./test.db"
    app_env: str = "development"
    default_locale: str = "en"
    supported_locales: List[str] = ["en", "uk", "ru"]
    app_title: str = "Order Processing Module"
    app_version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()