import { api, httpRequest } from '../hooks/useRequest';
import { getT } from '../hooks/useTranslations';
import { ApiResponse, Customer, CustomerCreate } from '../models';

// ─── API-функции для сущности Customer ───────────────────────────────────────

/** Создать нового клиента */
export async function createCustomer(
  data: CustomerCreate,
  callback?: (res: ApiResponse<Customer>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.post<ApiResponse<Customer>>('/customers', data),
    callback,
    t.api.customer.create.loading,
    t.api.customer.create.success
  );
}

/** Получить клиента по ID */
export async function getCustomerById(
  id: number,
  callback?: (res: ApiResponse<Customer>) => void
) {
  const t = getT();
  return httpRequest(
    () => api.get<ApiResponse<Customer>>(`/customers/${id}`),
    callback,
    t.api.customer.get.loading,
    t.api.customer.get.success
  );
}
