"""Unit tests for the Business Rules Service."""

import pytest
from decimal import Decimal

from app.core.exceptions import BusinessRuleViolationError, ValidationError
from app.models.models import Customer, Product
from app.rules import CustomerRules, OrderRules, ProductRules
from app.schemas.schemas import OrderCreate, OrderItemCreate


# ---------------------------------------------------------------------------
# CustomerRules
# ---------------------------------------------------------------------------

class TestCustomerRules:
    def test_email_unique_passes_when_no_existing(self):
        CustomerRules.ensure_email_unique(None, "new@example.com")  # must not raise

    def test_email_unique_raises_when_taken(self):
        existing = Customer(id=1, name="X", email="taken@example.com")
        with pytest.raises(BusinessRuleViolationError) as exc_info:
            CustomerRules.ensure_email_unique(existing, "taken@example.com")
        assert exc_info.value.message_key == "customer_email_taken"


# ---------------------------------------------------------------------------
# ProductRules
# ---------------------------------------------------------------------------

class TestProductRules:
    def test_sku_unique_passes_when_no_existing(self):
        ProductRules.ensure_sku_unique(None, "NEW-001")

    def test_sku_unique_raises_when_taken(self):
        existing = Product(id=1, name="P", sku="DUP-001", price=Decimal("10"))
        with pytest.raises(BusinessRuleViolationError) as exc_info:
            ProductRules.ensure_sku_unique(existing, "DUP-001")
        assert exc_info.value.message_key == "product_sku_taken"


# ---------------------------------------------------------------------------
# OrderRules
# ---------------------------------------------------------------------------

class TestOrderRules:
    def test_ensure_customer_exists_raises_when_none(self):
        with pytest.raises(BusinessRuleViolationError) as exc_info:
            OrderRules.ensure_customer_exists(None)
        assert exc_info.value.message_key == "order_no_customer"

    def test_ensure_customer_exists_passes(self):
        c = Customer(id=1, name="X", email="x@x.com")
        OrderRules.ensure_customer_exists(c)

    def test_ensure_has_items_raises_when_empty(self):
        with pytest.raises(BusinessRuleViolationError) as exc_info:
            OrderRules.ensure_has_items([])
        assert exc_info.value.message_key == "order_no_items"

    def test_ensure_has_items_passes(self):
        OrderRules.ensure_has_items([OrderItemCreate(product_id=1, quantity=1)])

    def test_ensure_item_quantity_invalid(self):
        """
        Pydantic's gt=0 guard prevents constructing an OrderItemCreate with
        quantity=0 via normal validation. We use model_construct() to bypass
        schema validation and test the rule method directly — simulating code
        paths (e.g. ORM hydration or internal mutation) that can bypass Pydantic.
        """
        from app.schemas.schemas import OrderItemCreate as OIC
        raw = OIC.model_construct(product_id=1, quantity=0)
        with pytest.raises(ValidationError):
            OrderRules.ensure_item_quantity_valid(raw)

    def test_ensure_products_exist_raises_for_missing(self):
        with pytest.raises(BusinessRuleViolationError) as exc_info:
            OrderRules.ensure_products_exist([1, 2], {1: Product()})
        assert exc_info.value.message_key == "order_item_product_not_found"
        assert exc_info.value.context["id"] == 2

    def test_validate_order_create_full_pass(self):
        customer = Customer(id=1, name="X", email="x@x.com")
        product = Product(id=10, name="P", sku="P-001", price=Decimal("9.99"))
        dto = OrderCreate(
            customer_id=1,
            items=[OrderItemCreate(product_id=10, quantity=2)],
        )
        OrderRules.validate_order_create(dto, customer, {10: product})  # must not raise
