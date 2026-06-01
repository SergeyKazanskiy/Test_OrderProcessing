"""Product request / response schemas."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, validator

from app.schemas.base import OrmBase


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)

    @validator("price")
    @classmethod
    def price_precision(cls, v: Decimal) -> Decimal:
        return round(v, 2)


class ProductResponse(OrmBase):
    id: int
    name: str
    sku: str
    description: Optional[str]
    price: Decimal
    created_at: datetime
    updated_at: datetime


__all__ = ["ProductCreate", "ProductResponse"]
