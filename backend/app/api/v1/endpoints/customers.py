from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_locale
from app.db.session import get_session
from app.i18n import translate
from app.schemas import ApiResponse, CustomerCreate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=ApiResponse[CustomerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
async def create_customer(
    dto: CustomerCreate,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[CustomerResponse]:
    service = CustomerService(session)
    customer = await service.create_customer(dto)
    return ApiResponse(
        message=translate("customer_created", locale),
        data=CustomerResponse.from_orm(customer),
    )


@router.get(
    "/{customer_id}",
    response_model=ApiResponse[CustomerResponse],
    summary="Get a customer by ID",
)
async def get_customer(
    customer_id: int,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[CustomerResponse]:
    service = CustomerService(session)
    customer = await service.get_customer(customer_id)
    return ApiResponse(
        message=translate("not_found", locale, resource="Customer", id=customer_id)
        if not customer
        else translate("customer_created", locale),  # re-use generic OK key
        data=CustomerResponse.from_orm(customer),
    )
