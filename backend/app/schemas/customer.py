"""Customer request / response schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from app.schemas.base import OrmBase
from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)


class CustomerResponse(OrmBase):
    id: int
    name: str
    email: str
    phone: Optional[str]
    created_at: datetime
    updated_at: datetime


__all__ = ["CustomerCreate", "CustomerResponse"]
