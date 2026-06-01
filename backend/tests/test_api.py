"""Integration tests against the full HTTP stack (SQLite in-memory)."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_customer(client: AsyncClient, email: str = "alice@example.com") -> dict:
    resp = await client.post(
        "/api/v1/customers",
        json={"name": "Alice", "email": email},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["data"]


async def _create_product(
    client: AsyncClient, sku: str = "PROD-001", price: str = "19.99"
) -> dict:
    resp = await client.post(
        "/api/v1/products",
        json={"name": "Widget", "sku": sku, "price": price},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["data"]


# ---------------------------------------------------------------------------
# Customer tests
# ---------------------------------------------------------------------------

class TestCustomerEndpoints:
    async def test_create_customer_success(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/customers",
            json={"name": "Bob", "email": "bob@example.com"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["email"] == "bob@example.com"

    async def test_create_customer_duplicate_email(self, client: AsyncClient):
        await _create_customer(client)
        resp = await client.post(
            "/api/v1/customers",
            json={"name": "Clone", "email": "alice@example.com"},
        )
        assert resp.status_code == 422
        assert resp.json()["success"] is False

    async def test_create_customer_invalid_email(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/customers",
            json={"name": "Bad", "email": "not-an-email"},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Product tests
# ---------------------------------------------------------------------------

class TestProductEndpoints:
    async def test_create_product_success(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/products",
            json={"name": "Gizmo", "sku": "GIZ-001", "price": "9.99"},
        )
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["sku"] == "GIZ-001"
        assert float(data["price"]) == pytest.approx(9.99)

    async def test_create_product_duplicate_sku(self, client: AsyncClient):
        await _create_product(client)
        resp = await client.post(
            "/api/v1/products",
            json={"name": "Copy", "sku": "PROD-001", "price": "5.00"},
        )
        assert resp.status_code == 422

    async def test_get_product_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/products/9999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Order tests
# ---------------------------------------------------------------------------

class TestOrderEndpoints:
    async def test_create_order_success(self, client: AsyncClient):
        customer = await _create_customer(client)
        product = await _create_product(client, price="25.00")

        resp = await client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer["id"],
                "items": [{"product_id": product["id"], "quantity": 3}],
            },
        )
        assert resp.status_code == 201
        order = resp.json()["data"]
        assert float(order["total_amount"]) == pytest.approx(75.00)
        assert len(order["items"]) == 1
        assert order["items"][0]["quantity"] == 3

    async def test_create_order_auto_total_multiple_items(self, client: AsyncClient):
        customer = await _create_customer(client)
        p1 = await _create_product(client, sku="P1", price="10.00")
        p2 = await _create_product(client, sku="P2", price="5.50")

        resp = await client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer["id"],
                "items": [
                    {"product_id": p1["id"], "quantity": 2},
                    {"product_id": p2["id"], "quantity": 4},
                ],
            },
        )
        assert resp.status_code == 201
        order = resp.json()["data"]
        # 2×10 + 4×5.5 = 20 + 22 = 42
        assert float(order["total_amount"]) == pytest.approx(42.00)

    async def test_create_order_no_customer(self, client: AsyncClient):
        await _create_product(client)
        resp = await client.post(
            "/api/v1/orders",
            json={"customer_id": 9999, "items": [{"product_id": 1, "quantity": 1}]},
        )
        assert resp.status_code == 422

    async def test_create_order_no_items_rejected_by_pydantic(self, client: AsyncClient):
        customer = await _create_customer(client)
        resp = await client.post(
            "/api/v1/orders",
            json={"customer_id": customer["id"], "items": []},
        )
        assert resp.status_code == 422

    async def test_create_order_product_not_found(self, client: AsyncClient):
        customer = await _create_customer(client)
        resp = await client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer["id"],
                "items": [{"product_id": 9999, "quantity": 1}],
            },
        )
        assert resp.status_code == 422

    async def test_get_orders_by_customer(self, client: AsyncClient):
        customer = await _create_customer(client)
        product = await _create_product(client)

        await client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer["id"],
                "items": [{"product_id": product["id"], "quantity": 1}],
            },
        )
        await client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer["id"],
                "items": [{"product_id": product["id"], "quantity": 2}],
            },
        )

        resp = await client.get(f"/api/v1/orders/by-customer/{customer['id']}")
        assert resp.status_code == 200
        orders = resp.json()["data"]
        assert len(orders) == 2

    async def test_get_orders_unknown_customer(self, client: AsyncClient):
        resp = await client.get("/api/v1/orders/by-customer/9999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Localisation tests
# ---------------------------------------------------------------------------

class TestLocalisation:
    async def test_ukrainian_error_message(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/customers/9999",
            headers={"Accept-Language": "uk"},
        )
        assert resp.status_code == 404
        assert "не знайдено" in resp.json()["message"]

    async def test_russian_error_message(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/customers/9999",
            headers={"Accept-Language": "ru"},
        )
        assert resp.status_code == 404
        assert "не найден" in resp.json()["message"]

    async def test_english_fallback(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/customers/9999",
            headers={"Accept-Language": "fr"},  # unsupported → fallback to en
        )
        assert resp.status_code == 404
        assert "not found" in resp.json()["message"].lower()
