import { api, httpRequest } from '../hooks/useRequest';
import { getT } from '../hooks/useTranslations';
import { ApiResponse, Order, OrderCreate } from '../models';

// ─── API-функции для сущности Order ──────────────────────────────────────────

/** Создать новый заказ */
export async function createOrder(
  data: OrderCreate,
  callback?: (res: ApiResponse<Order>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.post<ApiResponse<Order>>('/orders', data),
    callback,
    t.api.order.create.loading,
    t.api.order.create.success
  );
}

/** Получить заказ по ID */
export async function getOrderById(
  id: number,
  callback?: (res: ApiResponse<Order>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.get<ApiResponse<Order>>(`/orders/${id}`),
    callback,
    t.api.order.get.loading,
    t.api.order.get.success
  );
}

/** Получить все заказы клиента */
export async function getOrdersByCustomer(
  customerId: number,
  callback?: (res: ApiResponse<Order[]>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.get<ApiResponse<Order[]>>(`/orders/by-customer/${customerId}`),
    callback,
    t.api.order.byCustomer.loading,
    t.api.order.byCustomer.success
  );
}
