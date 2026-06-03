from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_locale
from app.db.session import get_session
from app.i18n import translate
from app.schemas import ApiResponse, OrderCreate, OrderResponse
from app.services.order_service import OrderService
from typing import List

router = APIRouter(prefix="/orders", tags=["Orders"])

# Эндпоинты для управления заказами.

# - POST /orders: создать новый заказ.
@router.post(
    "",
    response_model=ApiResponse[OrderResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
async def create_order(
    dto: OrderCreate,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[OrderResponse]:
    service = OrderService(session)
    order = await service.create_order(dto)
    return ApiResponse(
        message=translate("order_created", locale),
        data=OrderResponse.from_orm(order),
    )

# - GET /orders/by-customer/{customer_id}: получить все заказы для клиента.
@router.get(
    "/by-customer/{customer_id}",
    response_model=ApiResponse[List[OrderResponse]],
    summary="List all orders for a customer",
)
async def get_orders_by_customer(
    customer_id: int,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[list[OrderResponse]]:
    service = OrderService(session)
    orders = await service.get_orders_by_customer(customer_id)
    return ApiResponse(
        message=translate("order_created", locale),
        data=[OrderResponse.from_orm(o) for o in orders],
    )

# - GET /orders/{order_id}: получить заказ по ID.
@router.get(
    "/{order_id}",
    response_model=ApiResponse[OrderResponse],
    summary="Get an order by ID",
)
async def get_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[OrderResponse]:
    service = OrderService(session)
    order = await service.get_order(order_id)
    return ApiResponse(
        message=translate("order_created", locale),
        data=OrderResponse.from_orm(order),
    )
