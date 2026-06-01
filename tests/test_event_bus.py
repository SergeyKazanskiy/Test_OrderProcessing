"""Unit tests for the EventBus."""

from __future__ import annotations

import asyncio
import pytest
from app.events.bus import Event, EventBus


class TestEventBus:
    @pytest.fixture
    def bus(self) -> EventBus:
        return EventBus()

    async def test_subscribe_and_publish(self, bus: EventBus):
        received: list[Event] = []

        async def handler(event: Event) -> None:
            received.append(event)

        bus.subscribe("test.event", handler)
        await bus.publish(Event(event_type="test.event", payload={"x": 1}))
        await asyncio.sleep(0.05)  # let task complete

        assert len(received) == 1
        assert received[0].payload["x"] == 1

    async def test_sync_handler_supported(self, bus: EventBus):
        received: list[Event] = []

        def sync_handler(event: Event) -> None:
            received.append(event)

        bus.subscribe("sync.event", sync_handler)
        await bus.publish(Event(event_type="sync.event", payload={}))
        await asyncio.sleep(0.05)

        assert len(received) == 1

    async def test_handler_error_is_isolated(self, bus: EventBus):
        """A crashing handler must not prevent other handlers from running."""
        good_received: list[Event] = []

        async def bad_handler(event: Event) -> None:
            raise RuntimeError("boom")

        async def good_handler(event: Event) -> None:
            good_received.append(event)

        bus.subscribe("fail.event", bad_handler)
        bus.subscribe("fail.event", good_handler)

        await bus.publish(Event(event_type="fail.event", payload={}))
        await asyncio.sleep(0.05)

        assert len(good_received) == 1

    async def test_unsubscribe(self, bus: EventBus):
        received: list[Event] = []

        async def handler(event: Event) -> None:
            received.append(event)

        bus.subscribe("test.event", handler)
        bus.unsubscribe("test.event", handler)
        await bus.publish(Event(event_type="test.event", payload={}))
        await asyncio.sleep(0.05)

        assert len(received) == 0

    async def test_on_decorator(self, bus: EventBus):
        received: list[Event] = []

        @bus.on("decorated.event")
        async def handler(event: Event) -> None:
            received.append(event)

        await bus.publish(Event(event_type="decorated.event", payload={}))
        await asyncio.sleep(0.05)

        assert len(received) == 1

    async def test_no_handlers_no_error(self, bus: EventBus):
        # Should silently succeed with no subscribers
        await bus.publish(Event(event_type="ghost.event", payload={}))
