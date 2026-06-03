"""
Global exception handlers for the FastAPI application.

Maps domain exceptions → localised HTTP responses.
The locale is read from the request's Accept-Language header so every error
message is also translated.
"""

from __future__ import annotations

import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette import status

from app.core.exceptions import (
    AppError,
    BusinessRuleViolationError,
    NotFoundError,
    ValidationError,
)
from app.i18n import translate
from typing import Optional


logger = logging.getLogger(__name__)


def _locale_from_request(request: Request) -> str:
    from app.core.config import get_settings
    settings = get_settings()
    header = request.headers.get("accept-language", "")
    for part in header.split(","):
        tag = part.split(";")[0].strip().lower()
        base = tag.split("-")[0]
        if base in settings.supported_locales:
            return base
    return settings.default_locale


def _error_body(success: bool, message: str, detail: Optional[str] = None) -> dict:
    body: dict = {"success": success, "message": message}
    if detail:
        body["detail"] = detail
    return body


async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    locale = _locale_from_request(request)
    message = translate(exc.message_key, locale, **exc.context)
    logger.warning("NotFoundError: %s", message)
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=_error_body(False, message),
    )


async def business_rule_handler(
    request: Request, exc: BusinessRuleViolationError
) -> JSONResponse:
    locale = _locale_from_request(request)
    message = translate(exc.message_key, locale, **exc.context)
    logger.warning("BusinessRuleViolation: %s", message)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_body(False, message),
    )


async def validation_error_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    locale = _locale_from_request(request)
    message = translate(exc.message_key, locale, **exc.context)
    logger.warning("ValidationError: %s", message)
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=_error_body(False, message),
    )


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    locale = _locale_from_request(request)
    message = translate(exc.message_key, locale, **exc.context)
    logger.error("AppError: %s", message)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(False, message),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    locale = _locale_from_request(request)
    message = translate("internal_server_error", locale)
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(False, message, detail=str(exc)),
    )
