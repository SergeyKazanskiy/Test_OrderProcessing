"""
Localization engine.

Message catalogs are plain dicts keyed by locale → message_key → template.
Context variables are interpolated via str.format_map().
"""

from __future__ import annotations

from string import Formatter
from typing import Any

from app.core.config import get_settings
from typing import Optional

# ---------------------------------------------------------------------------
# Message catalogs
# ---------------------------------------------------------------------------

_CATALOGS: dict[str, dict[str, str]] = {
    "en": {
        # Generic
        "internal_server_error": "Internal server error.",
        "not_found": "{resource} with id={id} not found.",
        # Customer
        "customer_created": "Customer created successfully.",
        "customer_not_found": "Customer with id={id} not found.",
        "customer_email_taken": "Email '{email}' is already registered.",
        # Product
        "product_created": "Product created successfully.",
        "product_not_found": "Product with id={id} not found.",
        "product_sku_taken": "SKU '{sku}' is already in use.",
        # Order
        "order_created": "Order created successfully.",
        "order_not_found": "Order with id={id} not found.",
        "order_no_customer": "Cannot create an order without a valid customer.",
        "order_no_items": "An order must contain at least one item.",
        "order_item_product_not_found": "Product with id={id} not found for order item.",
        "order_item_quantity_invalid": "Item quantity must be a positive integer.",
        # Events
        "event_published": "Event '{event_type}' published.",
    },
    "uk": {
        "internal_server_error": "Внутрішня помилка сервера.",
        "not_found": "{resource} з id={id} не знайдено.",
        "customer_created": "Клієнта успішно створено.",
        "customer_not_found": "Клієнта з id={id} не знайдено.",
        "customer_email_taken": "Email '{email}' вже зареєстровано.",
        "product_created": "Товар успішно створено.",
        "product_not_found": "Товар з id={id} не знайдено.",
        "product_sku_taken": "Артикул '{sku}' вже використовується.",
        "order_created": "Замовлення успішно створено.",
        "order_not_found": "Замовлення з id={id} не знайдено.",
        "order_no_customer": "Неможливо створити замовлення без клієнта.",
        "order_no_items": "Замовлення повинно містити хоча б один товар.",
        "order_item_product_not_found": "Товар з id={id} не знайдено для позиції замовлення.",
        "order_item_quantity_invalid": "Кількість товару має бути цілим позитивним числом.",
        "event_published": "Подія '{event_type}' опублікована.",
    },
    "ru": {
        "internal_server_error": "Внутренняя ошибка сервера.",
        "not_found": "{resource} с id={id} не найден.",
        "customer_created": "Клиент успешно создан.",
        "customer_not_found": "Клиент с id={id} не найден.",
        "customer_email_taken": "Email '{email}' уже зарегистрирован.",
        "product_created": "Товар успешно создан.",
        "product_not_found": "Товар с id={id} не найден.",
        "product_sku_taken": "Артикул '{sku}' уже используется.",
        "order_created": "Заказ успешно создан.",
        "order_not_found": "Заказ с id={id} не найден.",
        "order_no_customer": "Невозможно создать заказ без клиента.",
        "order_no_items": "Заказ должен содержать хотя бы один товар.",
        "order_item_product_not_found": "Товар с id={id} не найден для позиции заказа.",
        "order_item_quantity_invalid": "Количество товара должно быть целым положительным числом.",
        "event_published": "Событие '{event_type}' опубликовано.",
    },
}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def translate(key: str, locale: Optional[str] = None, **context: Any) -> str:
    """
    Return a localised message for *key*.

    Falls back to the default locale, then to the raw key so callers never
    receive an empty string.
    """
    settings = get_settings()
    resolved = locale or settings.default_locale
    if resolved not in _CATALOGS:
        resolved = settings.default_locale

    catalog = _CATALOGS.get(resolved, {})
    template = catalog.get(key) or _CATALOGS.get(settings.default_locale, {}).get(key, key)

    # Safe interpolation — missing keys leave the placeholder intact
    try:
        return _safe_format(template, **context)
    except Exception:  # pragma: no cover
        return template


def _safe_format(template: str, **context: Any) -> str:
    """Format *template* with *context*, silently skipping unknown placeholders."""
    result_parts: list[str] = []
    for literal, field_name, format_spec, _ in Formatter().parse(template):
        result_parts.append(literal)
        if field_name is not None:
            value = context.get(field_name, f"{{{field_name}}}")
            result_parts.append(format(value, format_spec or ""))
    return "".join(result_parts)
