"""Order request / response schemas."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from app.models.enums import OrderStatus
from app.schemas.base import OrmBase


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, description="Must be a positive integer")


class OrderItemResponse(OrmBase):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

    @validator("items")
    @classmethod
    def items_not_empty(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not v:
            raise ValueError("order_no_items")
        return v


class OrderResponse(OrmBase):
    id: int
    customer_id: int
    status: OrderStatus
    total_amount: Decimal
    notes: Optional[str]
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime


__all__ = ["OrderItemCreate", "OrderItemResponse", "OrderCreate", "OrderResponse"]
