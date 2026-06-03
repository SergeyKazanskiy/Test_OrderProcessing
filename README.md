# 🛒 Order Processing Module

Модуль обработки заказов на базе **FastAPI + PostgreSQL + SQLAlchemy + Pydantic v2**.  
Реализует полный жизненный цикл заказа: от создания клиента и товара до оформления заказа с автоматическим расчётом суммы.

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура и ключевые решения](#-архитектура-и-ключевые-решения)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Конфигурация](#-конфигурация)
- [API Reference](#-api-reference)
- [Тесты](#-тесты)
- [Бизнес-правила](#-бизнес-правила)
- [Локализация](#-локализация)

---

## ✨ Возможности

| Функция | Описание |
|---|---|
| 👤 Создание клиента | Регистрация с проверкой уникальности email |
| 📦 Создание товара | Добавление товара с уникальным SKU и ценой |
| 🧾 Создание заказа | Оформление заказа с автоматическим расчётом суммы |
| 📋 Список заказов клиента | Получение всех заказов по ID клиента |
| 💰 Автоматический расчёт | Сумма заказа = Σ (unit_price × quantity) по всем позициям |
| 🌍 Локализация | Все ответы API переведены на EN / UK / RU |
| 📡 Event Bus | Публикация доменных событий при каждом создании сущности |

---

## 🛠 Технологический стек

| Компонент | Технология | Версия |
|---|---|---|
| Web-фреймворк | FastAPI | 0.115 |
| ORM | SQLAlchemy (async) | 2.0 |
| База данных | PostgreSQL / SQLite | — |
| Async-драйвер PG | asyncpg | 0.29 |
| Async-драйвер SQLite | aiosqlite | 0.20 |
| Валидация | Pydantic v2 | 2.9 |
| Конфигурация | pydantic-settings | 2.5 |
| Миграции | Alembic | 1.13 |
| Тесты | pytest + pytest-asyncio | 8.3 / 0.24 |
| HTTP-клиент для тестов | httpx (ASGITransport) | 0.27 |

---

## 🏛 Архитектура и ключевые решения

### Многослойная архитектура

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────┐
│         API Layer (FastAPI)         │  ← маршруты, locale dependency,
│   endpoints / exception_handlers    │    глобальные обработчики ошибок
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│        Service Layer                │  ← оркестрация use-case,
│  CustomerService / ProductService   │    вызов rules + repo + event_bus
│  OrderService                       │
└──────┬───────────────────┬──────────┘
       │                   │
       ▼                   ▼
┌────────────┐   ┌─────────────────────┐
│   Rules    │   │  Repository Layer   │  ← чистый доступ к БД,
│  Service   │   │  BaseRepository +   │    без бизнес-логики
│ (stateless)│   │  domain-specific    │
└────────────┘   └──────────┬──────────┘
                             │
                             ▼
                  ┌──────────────────┐
                  │   ORM Models     │  ← SQLAlchemy 2.0 mapped_column
                  │ Customer/Product │
                  │ Order/OrderItem  │
                  └──────────────────┘
```

---

### 📡 Event Bus — асинхронная шина событий

Реализован **in-process async Event Bus** (`app/events/bus.py`) на базе `asyncio.Task`.

**Принципы работы:**
- `publish()` — fire-and-forget: планирует каждый обработчик как отдельный `asyncio.Task`
- Издатель **не блокируется** и не ждёт завершения обработчиков
- Падение одного подписчика **изолировано** — другие обработчики продолжают работу
- Поддерживаются как `async def`, так и обычные `def` хэндлеры
- Декоратор `@bus.on("event.type")` для удобной регистрации

```python
# Публикация события в сервисе
await event_bus.publish(
    Event(
        event_type=OrderEvents.CREATED,
        payload={"order_id": order.id, "total_amount": str(order.total_amount)},
    )
)

# Подписка через декоратор
@event_bus.on("order.created")
async def on_order_created(event: Event) -> None:
    logger.info("New order: %s", event.payload["order_id"])
```

**Реализованные события:**

| Событие | Триггер |
|---|---|
| `customer.created` | Создание нового клиента |
| `product.created` | Создание нового товара |
| `order.created` | Оформление нового заказа |

---

### ⚖️ Выделенный Rules Service

Бизнес-правила вынесены в **отдельный stateless-слой** (`app/rules/order_rules.py`).

**Мотивация:**
- Правила меняются **независимо** от логики персистентности
- Легко тестировать как чистые функции — без БД, без HTTP
- Сервисы вызывают `Rules` до любой мутации данных

```python
# В OrderService — одна точка входа для всех правил
OrderRules.validate_order_create(dto, customer, found_products)
```

Три класса правил: `CustomerRules`, `ProductRules`, `OrderRules`.

---

### 🌍 Локализация ответов

Все сообщения API (успех и ошибки) возвращаются на языке клиента.

**Механизм:**
1. FastAPI-зависимость `get_locale` разбирает заголовок `Accept-Language`
2. Выбирается лучшее совпадение из поддерживаемых локалей (`en`, `uk`, `ru`)
3. Функция `translate(key, locale, **context)` подставляет переменные в шаблон
4. При неизвестной локали — fallback на `default_locale` (по умолчанию `en`)

```
Accept-Language: uk          →  "Замовлення успішно створено."
Accept-Language: ru          →  "Заказ успешно создан."
Accept-Language: fr          →  "Order created successfully."  (fallback)
```

---

### 💰 Автоматический расчёт суммы заказа

Метод `Order.recalculate_total()` вычисляет сумму на уровне доменной модели:

```python
def recalculate_total(self) -> None:
    self.total_amount = sum(
        (item.unit_price * item.quantity for item in self.items),
        Decimal("0.00"),
    )
```

`unit_price` **снапшотится** из `Product.price` в момент создания заказа — изменение цены товара в будущем не затрагивает уже созданные заказы.

---

### 🎁 Единый конверт ответа

Все эндпоинты возвращают унифицированную структуру:

```json
{
  "success": true,
  "message": "Order created successfully.",
  "data": { ... }
}
```

Ошибки:
```json
{
  "success": false,
  "message": "Customer with id=99 not found.",
  "detail": null
}
```

---

## 📁 Структура проекта

```
order_module/
│
├── app/
│   ├── main.py                          # Фабрика приложения, lifespan, регистрация хэндлеров
│   │
│   ├── core/
│   │   ├── config.py                    # Настройки через pydantic-settings (.env)
│   │   └── exceptions.py               # Иерархия AppError → NotFoundError,
│   │                                   # BusinessRuleViolationError, ValidationError
│   ├── db/
│   │   └── session.py                  # Async engine, AsyncSession, get_session dependency
│   │
│   ├── models/
│   │   ├── base.py          ← Base, utcnow()
│   │   ├── enums.py         ← OrderStatus
│   │   ├── customer.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── order_item.py
│   │
│   ├── schemas/
│   │   ├── base.py          ← OrmBase, ApiResponse, ErrorResponse
│   │   ├── customer.py
│   │   ├── product.py
│   │   └── order.py
│   │
│   ├── i18n/
│   │   └── translator.py               # Каталоги EN/UK/RU, функция translate()
│   │
│   ├── events/
│   │   ├── bus.py                      # EventBus: subscribe / publish / @on
│   │   ├── types.py                    # Константы: CustomerEvents, ProductEvents, OrderEvents
│   │   └── handlers.py                 # Подписчики событий (logging, уведомления и т.д.)
│   │
│   ├── rules/
│   │   └── order_rules.py              # Stateless rules: CustomerRules, ProductRules, OrderRules
│   │
│   ├── repositories/
│   │   ├── base.py                     # BaseRepository[T]: get_by_id, add, delete
│   │   ├── customer_repo.py            # + get_by_email
│   │   ├── product_repo.py             # + get_by_sku, get_by_ids
│   │   └── order_repo.py               # + get_by_customer, get_by_id_with_items
│   │
│   ├── services/
│   │   ├── customer_service.py         # create_customer, get_customer
│   │   ├── product_service.py          # create_product, get_product
│   │   └── order_service.py            # create_order, get_orders_by_customer, get_order
│   │
│   └── api/
│       ├── exception_handlers.py       # Маппинг AppError → локализованный HTTP-ответ
│       └── v1/
│           ├── dependencies.py         # get_locale из Accept-Language
│           └── endpoints/
│               ├── customers.py        # POST /customers, GET /customers/{id}
│               ├── products.py         # POST /products,  GET /products/{id}
│               └── orders.py           # POST /orders, GET /orders/{id},
│                                       # GET /orders/by-customer/{customer_id}
├── tests/
│   ├── conftest.py                     # Фикстуры: SQLite in-memory engine + ASGI test client
│   ├── test_api.py                     # Интеграционные тесты всех эндпоинтов
│   ├── test_rules.py                   # Unit-тесты бизнес-правил
│   ├── test_i18n.py                    # Unit-тесты переводчика
│   └── test_event_bus.py               # Unit-тесты шины событий
│
├── requirements.txt
├── pytest.ini
└── .env.example
```

---

## 🚀 Быстрый старт

### 1. Клонирование проекта

```bash
git clone <repo-url>
# cd Test_OrderProcessing // если не в папке
```

### 2. Создание виртуального окружения

```bash
python -m venv .venv # или python3 -m venv .venv
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Создание файла настроек

```bash
cp .env.example .env
```

### 5.1. Запуск с SQLite (без PostgreSQL — для разработки)

```bash
# DATABASE_URL по умолчанию = sqlite+aiosqlite:///./test.db
python -m uvicorn app.main:app --reload
```

### 5.2. Запуск с PostgreSQL

```bash
# Проверте файл .env
# Убедитесь, что PostgreSQL запущен и база создана:
# createdb orders_db

python -m uvicorn app.main:app --reload
```

После запуска:
- **Swagger UI** → http://127.0.0.1:8000/docs
- **ReDoc** → http://127.0.0.1:8000/redoc

> Таблицы создаются автоматически при старте приложения.  
> В продакшене используйте Alembic-миграции.

## 🌐 Интерактивная демонстрация

Для проверки работы backend-модуля и отправки тестовых запросов вы можете запустить веб-интерфейс прямо в браузере:

👉 [Открыть демонстрационную страницу](https://htmlpreview.github.io/?https://raw.githubusercontent.com/SergeyKazanskiy/Test_OrderProcessing/main/test.html)

---

## ⚙️ Конфигурация

Все параметры задаются через файл `.env` или переменные окружения:

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./test.db` | URL подключения к БД |
| `APP_ENV` | `development` | Окружение (`development` / `production`) |
| `DEFAULT_LOCALE` | `en` | Язык ответов по умолчанию |
| `SUPPORTED_LOCALES` | `en,uk,ru` | Список поддерживаемых локалей |

**Пример для PostgreSQL:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:secret@localhost:5432/orders_db
APP_ENV=production
DEFAULT_LOCALE=uk
```

---

## 📡 API Reference

### Клиенты

#### `POST /api/v1/customers` — Создать клиента

```bash
curl -X POST http://localhost:8000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Accept-Language: uk" \
  -d '{"name": "Іван Петренко", "email": "ivan@example.com", "phone": "+380501234567"}'
```

```json
{
  "success": true,
  "message": "Клієнта успішно створено.",
  "data": {
    "id": 1,
    "name": "Іван Петренко",
    "email": "ivan@example.com",
    "phone": "+380501234567",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### Товары

#### `POST /api/v1/products` — Создать товар

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Ноутбук Pro", "sku": "LAPTOP-PRO-001", "price": "45999.99", "description": "15\" IPS, 16GB RAM"}'
```

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": 1,
    "name": "Ноутбук Pro",
    "sku": "LAPTOP-PRO-001",
    "price": "45999.99",
    "description": "15\" IPS, 16GB RAM",
    "created_at": "2025-01-15T10:01:00Z",
    "updated_at": "2025-01-15T10:01:00Z"
  }
}
```

---

### Заказы

#### `POST /api/v1/orders` — Создать заказ

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ru" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2},
      {"product_id": 2, "quantity": 5}
    ],
    "notes": "Доставка до 18:00"
  }'
```

```json
{
  "success": true,
  "message": "Заказ успешно создан.",
  "data": {
    "id": 1,
    "customer_id": 1,
    "status": "pending",
    "total_amount": "92999.93",
    "notes": "Доставка до 18:00",
    "items": [
      {"id": 1, "product_id": 1, "quantity": 2, "unit_price": "45999.99", "line_total": "91999.98"},
      {"id": 2, "product_id": 2, "quantity": 5, "unit_price": "199.99",   "line_total": "999.95"}
    ],
    "created_at": "2025-01-15T10:05:00Z",
    "updated_at": "2025-01-15T10:05:00Z"
  }
}
```

#### `GET /api/v1/orders/by-customer/{customer_id}` — Заказы клиента

```bash
curl http://localhost:8000/api/v1/orders/by-customer/1 \
  -H "Accept-Language: uk"
```

#### `GET /api/v1/orders/{order_id}` — Получить заказ по ID

```bash
curl http://localhost:8000/api/v1/orders/1
```

---

### Коды ошибок

| HTTP статус | Ситуация |
|---|---|
| `400 Bad Request` | Ошибка валидации домена (например, отрицательная цена) |
| `404 Not Found` | Сущность не найдена |
| `422 Unprocessable Entity` | Нарушение бизнес-правила или ошибка схемы |

---

## 🧪 Тесты

### Запуск всех тестов

```bash
pytest tests/ -v
```

### Запуск с отчётом о покрытии

```bash
pip install pytest-cov
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Запуск отдельных групп

```bash
# Только интеграционные тесты API
pytest tests/test_api.py -v

# Только бизнес-правила
pytest tests/test_rules.py -v

# Только i18n
pytest tests/test_i18n.py -v

# Только Event Bus
pytest tests/test_event_bus.py -v
```

### Запуск конкретного теста

```bash
pytest tests/test_api.py::TestOrderEndpoints::test_create_order_auto_total_multiple_items -v
```

---

### 📊 Описание тестов

#### `test_api.py` — Интеграционные тесты (SQLite in-memory)

Поднимают полный стек приложения через `httpx.AsyncClient` + `ASGITransport`.  
База данных — SQLite в памяти, создаётся и удаляется для каждого теста.

| Класс | Тест | Что проверяет |
|---|---|---|
| `TestCustomerEndpoints` | `test_create_customer_success` | Успешное создание, структура ответа |
| | `test_create_customer_duplicate_email` | 422 при дублировании email |
| | `test_create_customer_invalid_email` | 422 при невалидном email |
| `TestProductEndpoints` | `test_create_product_success` | Создание товара, корректность цены |
| | `test_create_product_duplicate_sku` | 422 при дублировании SKU |
| | `test_get_product_not_found` | 404 при несуществующем ID |
| `TestOrderEndpoints` | `test_create_order_success` | Заказ создан, total = qty × price |
| | `test_create_order_auto_total_multiple_items` | Расчёт суммы по нескольким позициям |
| | `test_create_order_no_customer` | 422 при несуществующем customer_id |
| | `test_create_order_no_items_rejected_by_pydantic` | 422 при пустом списке товаров |
| | `test_create_order_product_not_found` | 422 при несуществующем product_id |
| | `test_get_orders_by_customer` | Список заказов, корректное количество |
| | `test_get_orders_unknown_customer` | 404 при несуществующем клиенте |
| `TestLocalisation` | `test_ukrainian_error_message` | Ответ содержит украинский текст |
| | `test_russian_error_message` | Ответ содержит русский текст |
| | `test_english_fallback` | Неизвестная локаль → fallback на EN |

---

#### `test_rules.py` — Unit-тесты бизнес-правил

Тестируют `CustomerRules`, `ProductRules`, `OrderRules` без БД и HTTP.

| Тест | Что проверяет |
|---|---|
| `test_email_unique_passes_when_no_existing` | Нет исключения если email свободен |
| `test_email_unique_raises_when_taken` | `BusinessRuleViolationError` при дубле |
| `test_sku_unique_raises_when_taken` | `BusinessRuleViolationError` при дубле SKU |
| `test_ensure_customer_exists_raises_when_none` | `order_no_customer` при `None` |
| `test_ensure_has_items_raises_when_empty` | `order_no_items` при пустом списке |
| `test_ensure_item_quantity_invalid` | `ValidationError` при quantity=0 (via `model_construct`) |
| `test_ensure_products_exist_raises_for_missing` | Корректный `id` в контексте ошибки |
| `test_validate_order_create_full_pass` | Вся цепочка правил без исключений |

---

#### `test_i18n.py` — Unit-тесты локализации

| Тест | Что проверяет |
|---|---|
| `test_english_key` | EN-каталог возвращает правильную строку |
| `test_ukrainian_key` | UK-каталог: "Замовлення" |
| `test_russian_key` | RU-каталог: "Заказ" |
| `test_interpolation` | Подстановка `{id}` в шаблон |
| `test_unknown_locale_falls_back_to_default` | Неизвестная локаль → не падает |
| `test_unknown_key_returns_key` | Несуществующий ключ → возвращает сам ключ |
| `test_missing_context_leaves_placeholder` | Отсутствующая переменная → `{id}` остаётся |

---

#### `test_event_bus.py` — Unit-тесты EventBus

| Тест | Что проверяет |
|---|---|
| `test_subscribe_and_publish` | Хэндлер получает событие с корректным payload |
| `test_sync_handler_supported` | Обычная `def`-функция работает как хэндлер |
| `test_handler_error_is_isolated` | Падение одного хэндлера не мешает другому |
| `test_unsubscribe` | После отписки хэндлер не вызывается |
| `test_on_decorator` | `@bus.on("event")` регистрирует хэндлер |
| `test_no_handlers_no_error` | Публикация без подписчиков не вызывает ошибки |

---

## 🔒 Бизнес-правила

Все правила проверяются до любого обращения к базе данных.

### Клиент
- Email должен быть **уникальным** в системе

### Товар
- SKU должен быть **уникальным** в системе
- Цена должна быть **строго положительной**

### Заказ
- Нельзя создать заказ **без существующего клиента**
- Заказ должен содержать **хотя бы один товар**
- Количество каждого товара в заказе — **положительное целое число**
- Все `product_id` в позициях заказа должны **существовать в БД**
- Сумма заказа **рассчитывается автоматически** и не принимается от клиента

---

## 🌍 Локализация

Для получения ответа на нужном языке передавайте заголовок `Accept-Language`:

```
Accept-Language: uk       # Українська
Accept-Language: ru       # Русский
Accept-Language: en       # English (default)
Accept-Language: uk,en;q=0.9   # Украинский с fallback на английский
```

Добавление нового языка — достаточно добавить словарь в `app/i18n/translator.py` и включить код локали в `SUPPORTED_LOCALES`.

# 🧪 Order Module — API Tester (Frontend)

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
# В директории backend:
python -m uvicorn app.main:app --reload
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

