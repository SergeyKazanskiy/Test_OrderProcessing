"""
In-process async Event Bus.

Design goals:
  • Handlers registered per event type (string tag).
  • publish() is fire-and-forget — it schedules handlers as asyncio tasks so
    the caller is never blocked by slow subscribers.
  • Errors in individual handlers are logged and isolated; they never bubble
    up to the publisher.
  • Supports both sync and async handler callables.
  • The bus instance is application-scoped (singleton via module-level object).
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Any, Coroutine, Union
from uuid import uuid4

logger = logging.getLogger(__name__)

HandlerType = Callable[..., Union[Any, Coroutine[Any, Any, Any]]]



# ---------------------------------------------------------------------------
# Event envelope
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Event:
    """Immutable event envelope published on the bus."""

    event_type: str
    payload: dict[str, Any]
    event_id: str = field(default_factory=lambda: str(uuid4()))
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Bus
# ---------------------------------------------------------------------------

class EventBus:
    """Lightweight in-process pub/sub event bus."""

    def __init__(self) -> None:
        self._handlers: dict[str, list[HandlerType]] = defaultdict(list)

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------

    def subscribe(self, event_type: str, handler: HandlerType) -> None:
        """Register *handler* to be called whenever *event_type* is published."""
        self._handlers[event_type].append(handler)
        logger.debug("Subscribed %s to event '%s'", handler.__qualname__, event_type)

    def unsubscribe(self, event_type: str, handler: HandlerType) -> None:
        """Remove *handler* from *event_type* subscribers (no-op if absent)."""
        handlers = self._handlers.get(event_type, [])
        try:
            handlers.remove(handler)
        except ValueError:
            pass

    # Decorator shorthand
    def on(self, event_type: str) -> Callable[[HandlerType], HandlerType]:
        def decorator(fn: HandlerType) -> HandlerType:
            self.subscribe(event_type, fn)
            return fn
        return decorator

    # ------------------------------------------------------------------
    # Publishing
    # ------------------------------------------------------------------

    async def publish(self, event: Event) -> None:
        """
        Publish *event* to all registered handlers.

        Each handler is executed as an independent asyncio Task so that:
          1. The publisher returns immediately after scheduling.
          2. A failing handler never affects other handlers or the publisher.
        """
        handlers = list(self._handlers.get(event.event_type, []))
        logger.info(
            "Publishing event '%s' (id=%s) to %d handler(s)",
            event.event_type,
            event.event_id,
            len(handlers),
        )

        for handler in handlers:
            asyncio.ensure_future(self._invoke(handler, event))

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    async def _invoke(handler: HandlerType, event: Event) -> None:
        try:
            result = handler(event)
            if inspect.isawaitable(result):
                await result
        except Exception:
            logger.exception(
                "Unhandled error in event handler '%s' for event '%s'",
                handler.__qualname__,
                event.event_type,
            )


# ---------------------------------------------------------------------------
# Application-scoped singleton
# ---------------------------------------------------------------------------

event_bus = EventBus()
