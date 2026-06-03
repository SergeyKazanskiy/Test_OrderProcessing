"""FastAPI dependency for locale resolution from Accept-Language header."""

from __future__ import annotations
from fastapi import Header
from app.core.config import get_settings
from typing import Optional


# Разрешение локали из заголовка Accept-Language.
async def get_locale(accept_language: Optional[str] = Header(default=None)) -> str:
    """
    Resolve the best matching locale from the Accept-Language header.

    Falls back to the application default locale when the header is absent
    or no supported locale matches.

    Examples:
        Accept-Language: uk          → "uk"
        Accept-Language: ru-RU,ru    → "ru"
        Accept-Language: fr-FR       → default_locale (no match)
    """
    settings = get_settings()
    if not accept_language:
        return settings.default_locale

    # Parse "uk,en;q=0.9,ru;q=0.8" → ["uk", "en", "ru"]
    for part in accept_language.split(","):
        tag = part.split(";")[0].strip().lower()
        base = tag.split("-")[0]  # "ru-RU" → "ru"
        if base in settings.supported_locales:
            return base

    return settings.default_locale
