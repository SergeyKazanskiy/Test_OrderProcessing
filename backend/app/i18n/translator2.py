
"""
Особенности:
- ленивое чтение каталогов переводов;
- кэширование каталогов в памяти;
- fallback на язык по умолчанию;
- fallback на ключ перевода;
- безопасная подстановка параметров;
- логирование проблем только в debug-режиме.

Структура файлов:
locales/
├── en.json
├── ru.json
├── uk.json
"""

from __future__ import annotations

import json
import logging

from pathlib import Path
from string import Formatter
from typing import Any

from app.core.config import get_settings


logger = logging.getLogger(__name__) # Инициализация логгера для этого модуля.
_CATALOG_CACHE: dict[str, dict[str, str]] = {} # Кэш для каталогов переводов.
_FORMATTER = Formatter() # Форматтер для безопасной подстановки параметров.


# Вспомогательная функция для логирования в debug-режиме.
def _debug_log(message: str, *args: Any) -> None:
    settings = get_settings()
    if settings.debug:
        logger.warning(message, *args)


# Получить путь к каталогу переводов.
def _locales_dir() -> Path:
    settings = get_settings()
    return Path(settings.locales_dir)


# Загружает каталог языка из файла.
def _load_catalog(locale: str) -> dict[str, str]:
    path = _locales_dir() / f"{locale}.json"

    if not path.exists():
        _debug_log( "Translation catalog not found: %s", path )
        return {}

    try:
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        if not isinstance(data, dict):
            _debug_log( "Invalid catalog structure: %s", path)
            return {}
        return { str(key): str(value) for key, value in data.items()}

    except json.JSONDecodeError:
        _debug_log( "Invalid JSON in translation catalog: %s",  path )
        return {}
    
    except OSError:
        _debug_log( "Cannot read translation catalog: %s", path )
        return {}


# Получить каталог языка из кэша или загрузить его.
def _get_catalog(locale: str) -> dict[str, str]:
    catalog = _CATALOG_CACHE.get(locale)

    if catalog is None:
        catalog = _load_catalog(locale)
        _CATALOG_CACHE[locale] = catalog
    return catalog


# Очистить кэш каталогов (например, при обновлении переводов).
def clear_translation_cache() -> None:
    _CATALOG_CACHE.clear()


# Безопасная подстановка параметров в шаблон перевода. 
def _safe_format( template: str, **context: Any ) -> str:
    result_parts: list[str] = []

    # Разбираем шаблон на части: литералы и поля. Например, "Привет, {name}" -> [("Привет, ", "name", "", None)]
    for literal, field_name, format_spec, _ in _FORMATTER.parse(template):
        result_parts.append(literal)

        if field_name is None:
            continue

        value = context.get(field_name, f"{{{field_name}}}") # Если параметр отсутствует, оставляем его в виде {field_name} в итоговой строке.
        result_parts.append(format(value, format_spec or "")) # Поддержка форматирования, например: "Количество проектов: {count:d}" -> "Количество проектов: 5" (если count=5) или "Количество проектов: {count:d}" (если count отсутствует).

    return "".join(result_parts)


# Основная функция для получения перевода по ключу и локали. Например, translate("hello", locale="ru") -> "Привет"
def translate(key: str, locale: str | None = None, **context: Any) -> str:
    settings = get_settings()

    requested_locale = locale or settings.default_locale # Если локаль не указана, используем локаль по умолчанию из настроек.
    default_locale = settings.default_locale

    current_catalog = _get_catalog(requested_locale)
    default_catalog = _get_catalog(default_locale)

    template = current_catalog.get(key) or default_catalog.get(key) or key

    try:
        return _safe_format(template, **context)

    except (ValueError, KeyError) as exc:
        _debug_log("Translation formatting error (key=%s, locale=%s): %s", key, requested_locale, exc)
        return template


# Экспорт функции локализации для использования в других частях приложения from app.i18n.translator2 import translate
_ = translate
