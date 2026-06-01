"""Order application service."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.events.bus import Event, event_bus
from app.events.types import OrderEvents
from app.models import Order, OrderItem
from app.repositories.customer_repo import CustomerRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.product_repo import ProductRepository
from app.rules import OrderRules
from app.schemas.order import OrderCreate
from app.core.exceptions import NotFoundError


class OrderService:
    def __init__(self, session: AsyncSession) -> None:
        self._order_repo = OrderRepository(session)
        self._customer_repo = CustomerRepository(session)
        self._product_repo = ProductRepository(session)

    async def create_order(self, dto: OrderCreate) -> Order:
        # 1. Fetch required domain objects
        customer = await self._customer_repo.get_by_id(dto.customer_id)
        product_ids = [item.product_id for item in dto.items]
        found_products = await self._product_repo.get_by_ids(product_ids)

        # 2. Apply all business rules (dedicated rules service)
        OrderRules.validate_order_create(dto, customer, found_products)

        # 3. Build order aggregate
        order = Order(
            customer_id=dto.customer_id,
            notes=dto.notes,
        )

        order.items = [
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=found_products[item.product_id].price,  # snapshot price
            )
            for item in dto.items
        ]

        # 4. Auto-calculate total
        order.recalculate_total()

        # 5. Persist
        order = await self._order_repo.add(order)

        # 6. Publish domain event
        await event_bus.publish(
            Event(
                event_type=OrderEvents.CREATED,
                payload={
                    "order_id": order.id,
                    "customer_id": order.customer_id,
                    "total_amount": str(order.total_amount),
                    "item_count": len(order.items),
                },
            )
        )
        return order

    async def get_orders_by_customer(self, customer_id: int) -> list[Order]:
        # Verify customer exists first
        customer = await self._customer_repo.get_by_id(customer_id)
        if customer is None:
            raise NotFoundError("customer_not_found", id=customer_id)
        return await self._order_repo.get_by_customer(customer_id)

    async def get_order(self, order_id: int) -> Order:
        order = await self._order_repo.get_by_id_with_items(order_id)
        if order is None:
            raise NotFoundError("order_not_found", id=order_id)
        return order
