"""Product application service."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.events.bus import Event, event_bus
from app.events.types import ProductEvents
from app.models.product import Product
from app.repositories.product_repo import ProductRepository
from app.rules import ProductRules
from app.schemas.product import ProductCreate
from app.core.exceptions import NotFoundError


class ProductService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = ProductRepository(session)

    async def create_product(self, dto: ProductCreate) -> Product:
        existing = await self._repo.get_by_sku(dto.sku)
        ProductRules.ensure_sku_unique(existing, dto.sku)
        ProductRules.ensure_price_positive(dto.price)

        product = Product(
            name=dto.name,
            sku=dto.sku,
            description=dto.description,
            price=dto.price,
        )
        product = await self._repo.add(product)

        await event_bus.publish(
            Event(
                event_type=ProductEvents.CREATED,
                payload={
                    "product_id": product.id,
                    "sku": product.sku,
                    "price": str(product.price),
                },
            )
        )
        return product

    async def get_product(self, product_id: int) -> Product:
        product = await self._repo.get_by_id(product_id)
        if product is None:
            raise NotFoundError("product_not_found", id=product_id)
        return product
