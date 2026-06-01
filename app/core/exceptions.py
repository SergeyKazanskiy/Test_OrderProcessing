from typing import Any


class AppError(Exception):
    """Base application exception carrying a translatable message key."""

    def __init__(self, message_key: str, **context: Any) -> None:
        self.message_key = message_key
        self.context = context
        super().__init__(message_key)


class NotFoundError(AppError):
    """Resource not found."""


class BusinessRuleViolationError(AppError):
    """A business rule was violated."""


class ValidationError(AppError):
    """Domain-level validation error."""
