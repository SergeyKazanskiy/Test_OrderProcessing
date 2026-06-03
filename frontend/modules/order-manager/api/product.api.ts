import { api, httpRequest } from '../hooks/useRequest';
import { getT } from '../hooks/useTranslations';
import { ApiResponse, Product, ProductCreate } from '../models';

// ─── API-функции для сущности Product ────────────────────────────────────────

/** Создать новый товар */
export async function createProduct(
  data: ProductCreate,
  callback?: (res: ApiResponse<Product>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.post<ApiResponse<Product>>('/products', data),
    callback,
    t.api.product.create.loading,
    t.api.product.create.success
  );
}

/** Получить товар по ID */
export async function getProductById(
  id: number,
  callback?: (res: ApiResponse<Product>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.get<ApiResponse<Product>>(`/products/${id}`),
    callback,
    t.api.product.get.loading,
    t.api.product.get.success
  );
}
