"""Application factory."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.api.exception_handlers import (
    app_error_handler,
    business_rule_handler,
    not_found_handler,
    unhandled_exception_handler,
    validation_error_handler,
)
from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.exceptions import AppError, BusinessRuleViolationError, NotFoundError, ValidationError
from app.db.session import Base, engine
from app.events.bus import event_bus
from app.events.handlers import on_customer_created, on_order_created, on_product_created
from app.events.types import CustomerEvents, OrderEvents, ProductEvents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)


def _register_event_handlers() -> None:
    event_bus.subscribe(CustomerEvents.CREATED, on_customer_created)
    event_bus.subscribe(ProductEvents.CREATED, on_product_created)
    event_bus.subscribe(OrderEvents.CREATED, on_order_created)


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:  # noqa: ARG001
    # ── Startup ────────────────────────────────────────────────────────────
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    _register_event_handlers()
    yield
    # ── Shutdown ───────────────────────────────────────────────────────────
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=_lifespan,
    )

    # ── Routers ────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    # ── Exception handlers ─────────────────────────────────────────────────
    app.add_exception_handler(NotFoundError, not_found_handler)                    # type: ignore[arg-type]
    app.add_exception_handler(BusinessRuleViolationError, business_rule_handler)   # type: ignore[arg-type]
    app.add_exception_handler(ValidationError, validation_error_handler)           # type: ignore[arg-type]
    app.add_exception_handler(AppError, app_error_handler)                         # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)              # type: ignore[arg-type]

    return app


app = create_app()