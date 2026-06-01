"""
Business Rules Service.

This is a dedicated, stateless service that encapsulates ALL domain business
rules as pure-function validators. It has no database access; it operates
solely on domain objects and plain data passed to it.

Separation rationale:
  • Rules change independently of persistence logic — keeping them isolated
    makes them trivial to test, audit, and swap without touching repositories.
  • Service classes that orchestrate use-cases call this before any mutation.
  • Rules raise typed AppError subclasses so the API layer can translate them
    to localised HTTP responses uniformly.
"""

from __future__ import annotations

from decimal import Decimal

from app.core.exceptions import BusinessRuleViolationError, ValidationError
from app.models import Customer, Product
from app.schemas import OrderCreate, OrderItemCreate
from typing import Optional


class CustomerRules:
    """Business rules for the Customer domain."""

    @staticmethod
    def ensure_email_unique(existing_customer: Optional[Customer], email: str) -> None:
        """Raise if *email* is already taken by another customer."""
        if existing_customer is not None:
            raise BusinessRuleViolationError("customer_email_taken", email=email)


class ProductRules:
    """Business rules for the Product domain."""

    @staticmethod
    def ensure_sku_unique(existing_product: Optional[Product], sku: str) -> None:
        """Raise if *sku* is already in use."""
        if existing_product is not None:
            raise BusinessRuleViolationError("product_sku_taken", sku=sku)

    @staticmethod
    def ensure_price_positive(price: Decimal) -> None:
        """Raise if *price* is not positive."""
        if price <= Decimal("0"):
            raise ValidationError("product_price_invalid", price=str(price))


class OrderRules:
    """Business rules for the Order domain."""

    @staticmethod
    def ensure_customer_exists(customer: Optional[Customer]) -> None:
        """An order cannot be created without a valid customer."""
        if customer is None:
            raise BusinessRuleViolationError("order_no_customer")

    @staticmethod
    def ensure_has_items(items: list[OrderItemCreate]) -> None:
        """An order must contain at least one item."""
        if not items:
            raise BusinessRuleViolationError("order_no_items")

    @staticmethod
    def ensure_item_quantity_valid(item: OrderItemCreate) -> None:
        """Each item must have a positive integer quantity."""
        if item.quantity < 1:
            raise ValidationError("order_item_quantity_invalid")

    @staticmethod
    def ensure_products_exist(
        requested_ids: list[int],
        found_products: dict[int, Product],
    ) -> None:
        """All product IDs referenced in the order must exist."""
        for pid in requested_ids:
            if pid not in found_products:
                raise BusinessRuleViolationError("order_item_product_not_found", id=pid)

    @classmethod
    def validate_order_create(
        cls,
        dto: OrderCreate,
        customer: Optional[Customer],
        found_products: dict[int, Product],
    ) -> None:
        """Run all creation rules for a new order in the correct sequence."""
        cls.ensure_customer_exists(customer)
        cls.ensure_has_items(dto.items)
        for item in dto.items:
            cls.ensure_item_quantity_valid(item)
        cls.ensure_products_exist(
            [item.product_id for item in dto.items], found_products
        )
