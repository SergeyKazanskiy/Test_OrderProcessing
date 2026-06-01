from __future__ import annotations

from sqlalchemy import select

from app.models import Product
from app.repositories.base import BaseRepository
from typing import Optional

class ProductRepository(BaseRepository[Product]):
    model = Product

    async def get_by_sku(self, sku: str) -> Optional[Product]:
        result = await self._session.execute(
            select(Product).where(Product.sku == sku)
        )
        return result.scalars().first()

    async def get_by_ids(self, ids: list[int]) -> dict[int, Product]:
        if not ids:
            return {}
        result = await self._session.execute(
            select(Product).where(Product.id.in_(ids))
        )
        return {p.id: p for p in result.scalars().all()}
