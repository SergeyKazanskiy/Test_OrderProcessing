"""
Domain event handlers.

Each handler is a pure async function subscribed to a specific event type.
Handlers are registered at application startup (see app/main.py).
"""

from __future__ import annotations

import logging

from app.events.bus import Event

logger = logging.getLogger(__name__)


async def on_customer_created(event: Event) -> None:
    logger.info(
        "[EVENT] customer.created | customer_id=%s email=%s",
        event.payload.get("customer_id"),
        event.payload.get("email"),
    )


async def on_product_created(event: Event) -> None:
    logger.info(
        "[EVENT] product.created | product_id=%s sku=%s",
        event.payload.get("product_id"),
        event.payload.get("sku"),
    )


async def on_order_created(event: Event) -> None:
    logger.info(
        "[EVENT] order.created | order_id=%s customer_id=%s total=%s",
        event.payload.get("order_id"),
        event.payload.get("customer_id"),
        event.payload.get("total_amount"),
    )
