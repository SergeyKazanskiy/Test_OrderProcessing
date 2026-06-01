from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models import Order
from app.repositories.base import BaseRepository
from typing import Optional


class OrderRepository(BaseRepository[Order]):
    model = Order

    async def get_by_customer(self, customer_id: int) -> list[Order]:
        result = await self._session.execute(
            select(Order)
            .where(Order.customer_id == customer_id)
            .options(
                selectinload(Order.items),
            )
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id_with_items(self, order_id: int) -> Optional[Order]:
        result = await self._session.execute(
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.items))
        )
        return result.scalars().first()
