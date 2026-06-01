from __future__ import annotations

from sqlalchemy import select

from app.models import Customer
from app.repositories.base import BaseRepository
from typing import Optional


class CustomerRepository(BaseRepository[Customer]):
    model = Customer

    async def get_by_email(self, email: str) -> Optional[Customer]:
        result = await self._session.execute(
            select(Customer).where(Customer.email == email)
        )
        return result.scalars().first()
