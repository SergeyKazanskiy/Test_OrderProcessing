"""Customer application service."""

from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession

from app.events.bus import Event, event_bus
from app.events.types import CustomerEvents
from app.models.customer import Customer
from app.repositories.customer_repo import CustomerRepository
from app.rules import CustomerRules
from app.schemas.customer import CustomerCreate
from app.core.exceptions import NotFoundError


class CustomerService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = CustomerRepository(session)

    async def create_customer(self, dto: CustomerCreate) -> Customer:
        existing = await self._repo.get_by_email(dto.email)
        CustomerRules.ensure_email_unique(existing, dto.email)

        customer = Customer(name=dto.name, email=dto.email, phone=dto.phone)
        customer = await self._repo.add(customer)

        await event_bus.publish(
            Event(
                event_type=CustomerEvents.CREATED,
                payload={
                    "customer_id": customer.id,
                    "email": customer.email,
                    "name": customer.name,
                },
            )
        )
        return customer

    async def get_customer(self, customer_id: int) -> Customer:
        customer = await self._repo.get_by_id(customer_id)
        if customer is None:
            raise NotFoundError("customer_not_found", id=customer_id)
        return customer
