// ─── Типы всех сущностей Order Processing Module ────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type Lang = 'en' | 'uk' | 'ru';
export type TabId =
  | 'create-customer' | 'get-customer'
  | 'create-product'  | 'get-product'
  | 'create-order'    | 'get-order'
  | 'orders-by-customer' | 'business-rules';

// ─── Клиент ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
}

// ─── Товар ──────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: string;
  description?: string;
}

// ─── Позиция заказа ─────────────────────────────────────────────────────────

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

// ─── Заказ ──────────────────────────────────────────────────────────────────

export interface Order {
  id: number;
  customer_id: number;
  status: OrderStatus;
  total_amount: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
  notes?: string;
}

// ─── Конверт ответа API ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ─── Запись истории запросов ──────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  method: 'POST' | 'GET';
  path: string;
  status: number;
  elapsed: number;
  data: unknown;
  timestamp: Date;
}

// ─── Результат теста бизнес-правила ──────────────────────────────────────────

export type RuleResult = 'pass' | 'fail' | 'idle';
