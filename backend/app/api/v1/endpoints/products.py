from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_locale
from app.db.session import get_session
from app.i18n import translate
from app.schemas import ApiResponse, ProductCreate, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
)
async def create_product(
    dto: ProductCreate,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[ProductResponse]:
    service = ProductService(session)
    product = await service.create_product(dto)
    return ApiResponse(
        message=translate("product_created", locale),
        data=ProductResponse.from_orm(product),
    )


@router.get(
    "/{product_id}",
    response_model=ApiResponse[ProductResponse],
    summary="Get a product by ID",
)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    locale: str = Depends(get_locale),
) -> ApiResponse[ProductResponse]:
    service = ProductService(session)
    product = await service.get_product(product_id)
    return ApiResponse(
        message=translate("product_created", locale),
        data=ProductResponse.from_orm(product),
    )
