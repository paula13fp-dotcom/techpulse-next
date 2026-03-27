"""Configuration loaded from environment variables (GitHub Actions secrets)."""
from __future__ import annotations
import os

def _get(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)

class Settings:
    # Supabase
    SUPABASE_URL: str = _get("SUPABASE_URL", "https://witndqgbaxpgtpsxqfhf.supabase.co")
    SUPABASE_SERVICE_KEY: str | None = _get("SUPABASE_SERVICE_KEY")

    # YouTube
    YOUTUBE_API_KEY: str | None = _get("YOUTUBE_API_KEY")

    # Google Gemini
    GEMINI_API_KEY: str | None = _get("GEMINI_API_KEY")

    # X / Twitter
    X_USERNAME: str | None = _get("X_USERNAME")
    X_EMAIL: str | None = _get("X_EMAIL")
    X_PASSWORD: str | None = _get("X_PASSWORD")

    # Vercel revalidation
    REVALIDATE_URL: str | None = _get("REVALIDATE_URL")
    REVALIDATE_SECRET: str | None = _get("REVALIDATE_SECRET")

    # Scraping
    MAX_POSTS_PER_RUN: int = int(_get("MAX_POSTS_PER_RUN", "100"))

    @classmethod
    def has_youtube(cls) -> bool:
        return bool(cls.YOUTUBE_API_KEY)

    @classmethod
    def has_gemini(cls) -> bool:
        return bool(cls.GEMINI_API_KEY)

    @classmethod
    def has_x(cls) -> bool:
        return bool(cls.X_USERNAME and cls.X_EMAIL and cls.X_PASSWORD)

settings = Settings()
