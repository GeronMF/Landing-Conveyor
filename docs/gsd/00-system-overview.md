## Goal
Дать целостное представление о системе Landing Conveyor: для кого она создана, какую бизнес-проблему решает и из каких основных модулей состоит.

## Solution
Landing Conveyor — это платформа-конвейер для лендингов, заточенная под e‑commerce и товарный бизнес. Она позволяет быстро запускать и тиражировать продающие страницы с несколькими вариантами товара, централизованно управлять контентом и формами заявок, а также гибко маршрутизировать эти заявки в внешние CRM/магазины (CS-Cart, KeyCRM и т.п.). Архитектура: **Next.js Admin UI → Backend API (Next.js App Router + Prisma) → MySQL БД** + интеграции с внешними CRM через адаптеры.

## Details

### Назначение и бизнес-ценность

- **Целевая аудитория**: владельцы интернет-магазинов, маркетологи, арбитражники и агентства, которым нужно быстро штамповать лендинги под разные офферы/сезоны/акции.
- **Бизнес-проблема**: классический CMS или конструктор тяжёл для массового запуска однотипных лендингов под performance‑маркетинг. Требуются:
  - быстрый дубликационный конвейер,
  - единые шаблоны/темы,
  - интеграции с CRM/складом,
  - отслеживание источников трафика.
- **Решение**:
  - единая админка для всех лендингов;
  - многошаговый контент (варианты, галереи, видео, отзывы, FAQ, секции «Як замовити» и «Доставка та оплата»);
  - централизованный модуль заявок (Leads) с гибкой доставкой в CRM.

### Архитектура на высоком уровне

- **Frontend / Admin UI**
  - Next.js 13 (App Router), TypeScript.
  - Приватная админ-панель под `/admin/*`:
    - `/admin/login` — авторизация.
    - `/admin/landings` — список лендингов.
    - `/admin/landings/[id]` — редактор лендинга.
    - `/admin/leads` — список заявок.
    - `/admin/videos` — управление видеофайлами.
  - Публичные лендинги:
    - `GET /l/[slug]` — страница лендинга.
    - `GET /l/[slug]?preview=1` — превью драфтов.

- **Backend / API**
  - Next.js App Router API routes под `app/api/*`.
  - Основные подсистемы:
    - Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
    - Admin CRUD: `/api/admin/landings`, `/api/admin/variants`, `/api/admin/faqs`, `/api/admin/leads`, `/api/admin/videos`, вспомогательные роуты.
    - Public Leads: `POST /api/leads` — создание заявки; `POST /api/leads/retry` — служебный retry.
  - Взаимодействие с БД через Prisma ORM.
  - Модуль диспетчеризации заявок (`lib/order-dispatcher.ts`) выбирает адаптер (CS-Cart / KeyCRM) на основе настроек лендинга.

- **База данных**
  - MySQL/MariaDB, схема в `prisma/schema.prisma`.
  - Ключевые модели:
    - `User` — администраторы.
    - `Landing` — лендинги.
    - `Variant` — варианты товара.
    - `FAQ`, `Review`, `Benefit`, `Specification`, `SizeTable`, `SizeTableRow`.
    - `Lead` — заявки.
    - `Theme` — темы оформления.

- **Интеграции с внешними системами**
  - **CS-Cart**:
    - через PHP‑webhook и/или REST API (`lib/cscart.ts`),
    - вариант хранит `cscartProductId`.
  - **KeyCRM**:
    - REST API `POST https://openapi.keycrm.app/v1/order`,
    - лендинг хранит настройки канала доставки (`orderDestination`, KeyCRM‑ключ и ID источника/менеджера),
    - вариант хранит `keycrmOfferSku`.

### Технологический стек

- **Ядро**: Next.js 13 (App Router), React 18, TypeScript 5, Node.js 18+.
- **UI**: TailwindCSS + shadcn/ui, Lucide icons, React Hook Form + Zod.
- **База данных**: MySQL / MariaDB, Prisma ORM.
- **Auth**: собственная JWT‑аутентификация с httpOnly‑cookie.
- **Инфраструктура**: Docker, Docker Compose, Nginx, PM2/systemd, Netlify (опционально).

### Структура папок проекта

Краткий обзор (упрощённо):

```text
project/
  app/
    admin/             # Админ UI
    api/               # API Next.js (Admin + Public)
    l/[slug]/          # Публичные лендинги
  components/
    admin/             # Админ-компоненты
    landing/           # Компоненты публичного лендинга
    ui/                # shadcn/ui
  lib/
    auth.ts            # Аутентификация
    db.ts              # Prisma client
    cscart.ts          # CS-Cart adapter
    order-dispatcher.ts# Диспетчер заявок (CS-Cart / KeyCRM)
    utils.ts           # Утилиты
  prisma/
    schema.prisma      # Схема БД
    seed.ts            # Первичный сидинг
  public/
    uploads/           # Медиафайлы
    video/             # Видео для лендингов
  docs/
    gsd/               # GSD-документация (этот каталог)
  docker-compose.yml
  Dockerfile
  nginx.conf.example
  ecosystem.config.js
  .env.example
  README.md
  QUICKSTART.md
  PROJECT_SUMMARY.md
```

### ENV‑переменные (обзор)

Полный список и подробности — в `docs/gsd/11-cloning-and-deployment.md`, здесь — обзорно:

- **База данных**
  - `DATABASE_URL` — строка подключения Prisma к MySQL/MariaDB.
- **Админ / аутентификация**
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — начальный администратор.
  - `NEXTAUTH_SECRET` / `JWT_SECRET` — секреты для токенов.
  - `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` — URL инстанса.
- **CS-Cart**
  - `CSCART_PHP_WEBHOOK_URL`, `CSCART_PHP_WEBHOOK_SECRET` — PHP‑webhook.
  - `CSCART_API_URL`, `CSCART_API_TOKEN` — REST API.
  - `LEAD_DELIVERY_MODE` — режим доставки (`cscart_api` / `webhook`).
  - `LEAD_RETRY_SECRET` — токен для ретрая через `POST /api/leads/retry`.
- **KeyCRM**
  - `KEYCRM_API_KEY` — глобальный API‑ключ.
  - `KEYCRM_DEFAULT_SOURCE_ID`, `KEYCRM_DEFAULT_MANAGER_ID` — значения по умолчанию, если не заданы на лендинге.

### Edge cases / важные моменты

- **Мультиинстанс**:
  - Каждый инстанс системы (домен) должен иметь свой `.env` и отдельную БД.
  - Файлы `public/uploads` и `public/video` относятся к конкретному инстансу.
- **Секреты**:
  - `.env` **никогда** не коммитится в git.
  - Ключи CS-Cart и KeyCRM обязательно хранить только в переменных окружения или полях с шифрованием.
- **Совместимость**:
  - В `Landing` и связанных сущностях есть «старые» JSON/`old*` поля для обратной совместимости с предыдущими версиями (например, `oldVariants`, `faqsJson`); при рефакторингах нужно учитывать их наличие.
- **Производительность и безопасность**:
  - Есть rate limiting для `POST /api/leads`.
  - Honeypot‑поле для anti‑spam.
  - Валидация входящих данных через Zod.

