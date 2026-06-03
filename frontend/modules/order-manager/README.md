# 🧪 Order Module — API Tester

Интерактивный тест-клиент для **Order Processing Module** (FastAPI + PostgreSQL).  
Написан на **Next.js 14 / TypeScript**, использует **Tailwind CSS** и **Zustand**.

---

## ✨ Возможности

| Функция | Описание |
|---|---|
| 7 эндпоинтов | Клиенты, Товары, Заказы — все CRUD-операции модуля |
| Панель ответа | JSON с подсветкой синтаксиса, статус, время выполнения |
| История запросов | До 50 записей, клик — загружает ответ в панель |
| Бизнес-правила | 8 готовых тестов — нажми Run и убедись что сервер отказывает |
| i18n | Интерфейс на EN / UK / RU, локаль бэкенда — отдельный select |
| Тёмная тема | Переключатель в топбаре, сохраняется в localStorage |
| Настройка URL | Base URL бэкенда меняется прямо в топбаре |

---

## 🛠 Технологии

| | |
|---|---|
| **Next.js 14** | App Router, Server / Client Components |
| **TypeScript** | Строгая типизация всех сущностей |
| **Tailwind CSS** | Утилитарные классы + дизайн-токены через CSS-переменные |
| **Zustand** | Стейт-менеджмент: settings, navigation, response, customer, product, order |
| **Axios** | HTTP-запросы с интерцептором baseUrl + Accept-Language |
| **Sonner** | Toast-уведомления (loading / success / error) |
| **SASS/SCSS** | Кнопки, анимации, JSON-подсветка, скроллбары |

---

## 📁 Структура модуля

```
src/modules/order-tester/
│
├── index.tsx                  # Корневой компонент, маппинг вкладок → панели
├── models.ts                  # Все TypeScript-типы (Customer, Product, Order, …)
├── styles.scss                # Цвета (OKLCH), шрифты, кнопки, анимации
│
├── translations/
│   ├── en.json                # Переводы английский
│   ├── uk.json                # Переводы украинский
│   └── ru.json                # Переводы русский
│
├── stores/
│   ├── settings.store.ts      # baseUrl, locale, lang, dark-тема
│   ├── api.store.ts           # isLoading, errorMessage
│   ├── navigation.store.ts    # activeTab
│   ├── response.store.ts      # status, data, elapsed, history[]
│   ├── customer.store.ts      # Форма создания/поиска клиента
│   ├── product.store.ts       # Форма создания/поиска товара
│   └── order.store.ts         # Форма создания/поиска заказа + items[]
│
├── hooks/
│   ├── useTranslations.ts     # useTranslations() + getT() для вне-React
│   └── useRequest.ts          # axios-инстанс + универсальный httpRequest()
│
├── api/
│   ├── customer.api.ts        # createCustomer(), getCustomerById()
│   ├── product.api.ts         # createProduct(), getProductById()
│   └── order.api.ts           # createOrder(), getOrderById(), getOrdersByCustomer()
│
├── components/                # Простые переиспользуемые компоненты
│   ├── MethodBadge.tsx        # Бейдж POST / GET / INFO
│   ├── TextInput.tsx          # Стилизованный input
│   ├── Field.tsx              # label + hint + children
│   ├── Button.tsx             # primary / secondary / outline / ghost
│   ├── SectionCard.tsx        # Карточка с шапкой и телом
│   ├── StatusBadge.tsx        # Цветной индикатор HTTP-статуса
│   ├── JsonViewer.tsx         # JSON с подсветкой синтаксиса
│   ├── OrderItemRow.tsx       # Строка позиции заказа
│   └── EndpointPath.tsx       # /orders/{id} с подсветкой параметров
│
├── views/                     # Компоненты подключённые к сторам
│   ├── TopbarView.tsx         # Топбар: настройки, lang, тема
│   ├── SidebarView.tsx        # Навигация по вкладкам
│   ├── PanelHeaderView.tsx    # Заголовок активной панели
│   ├── ResponsePanelView.tsx  # Правая панель: Body + History
│   ├── CreateCustomerView.tsx
│   ├── GetCustomerView.tsx
│   ├── CreateProductView.tsx
│   ├── GetProductView.tsx
│   ├── CreateOrderView.tsx
│   ├── GetOrderView.tsx
│   ├── OrdersByCustomerView.tsx
│   └── BusinessRulesView.tsx  # 8 тестов бизнес-правил
│
└── alerts/
    ├── ValidationAlert.tsx    # Ошибка валидации формы
    └── RuleResultAlert.tsx    # Результат теста правила (pass / fail)
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
# или
yarn install
```

### 2. Переменные окружения

```bash
cp .env.example .env.local
```

```env
# .env.local — не нужен, baseUrl настраивается прямо в интерфейсе
# Опционально для деплоя:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### 3. Запустить бэкенд (Python)

```bash
# В директории order_module:
uvicorn app.main:app --reload
# → http://127.0.0.1:8000
```

### 4. Запустить тест-клиент

```bash
npm run dev
# → http://localhost:3000
```

---

## 📦 Необходимые npm-пакеты

```bash
npm install zustand axios sonner sass
npm install -D @types/node
```

---

## 🔌 Подключение модуля в Next.js

```tsx
// app/page.tsx или любой route
import OrderTester from '@/modules/order-tester';

export default function Page() {
  return <OrderTester />;
}
```

---

## 🧪 Бизнес-правила — как тестировать

Вкладка **Business Rules** содержит 8 готовых сценариев:

| Правило | Что проверяет | Ожидается |
|---|---|---|
| Duplicate email | Создать клиента с уже занятым email | 422 |
| Invalid email | Отправить невалидный email | 422 |
| Duplicate SKU | Создать товар с уже занятым SKU | 422 |
| Zero price | Цена товара = 0 | 422 |
| No customer | Заказ с несуществующим customer_id | 422 |
| Empty items | Заказ с пустым списком позиций | 422 |
| Product not found | Заказ с несуществующим product_id | 422 |
| Zero quantity | Позиция заказа с quantity = 0 | 422 |

Каждый тест:
1. Принимает входное значение (email, SKU, ID…)
2. Отправляет запрос на бэкенд
3. Показывает **Rule enforced ✓** если сервер ответил 4xx (правило работает)
4. Показывает **Rule NOT enforced ✗** если сервер принял запрос (баг)

Ответ сервера всегда отображается в правой панели.

---

## 🎨 Система цветов

Используется `colors.css` с OKLCH-переменными (светлая/тёмная тема):

```css
/* Переключение темы — добавить/убрать класс .dark на <html> */
document.documentElement.classList.toggle('dark', isDark);
```

Ключевые токены:

| Переменная | Назначение |
|---|---|
| `--color-background` | Фон страницы |
| `--color-surface` | Карточки, сайдбар |
| `--color-primary` | Акцент, кнопки, активные состояния |
| `--color-border` | Разделители |
| `--color-muted` | Фон шапок секций |
| `--color-muted-foreground` | Вторичный текст, плейсхолдеры |

---

## 📡 Паттерн API-функций

```typescript
// Каждая функция следует одному паттерну:
export async function createCustomer(
  data: CustomerCreate,
  callback?: (res: ApiResponse<Customer>) => void
) {
  const t = getT(); // Переводы вне React
  return httpRequest(
    () => api.post<ApiResponse<Customer>>('/customers', data),
    callback,
    t.api.customer.create.loading,  // Toast loading
    t.api.customer.create.success   // Toast success
  );
}
```

`httpRequest` автоматически:
- Управляет `isLoading` через `useApiStore`
- Показывает Toast (loading → success / error)
- Записывает ответ в `useResponseStore` для панели
- Добавляет запись в историю
- Показывает даже ошибочные ответы (4xx) — важно для тестов
