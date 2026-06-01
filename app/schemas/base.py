"""Shared Pydantic base classes and API envelope."""

from __future__ import annotations

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar("T")


class OrmBase(BaseModel):
    """Base model с orm_mode для всех Response-схем."""

    class Config:
        orm_mode = True


class ApiResponse(GenericModel, Generic[T]):
    """Uniform API response wrapper."""

    success: bool = True
    message: str
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None


__all__ = ["OrmBase", "ApiResponse", "ErrorResponse"]
