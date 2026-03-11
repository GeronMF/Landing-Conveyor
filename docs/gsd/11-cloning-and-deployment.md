## Goal
Описать процесс деплоя и клонирования системы Landing Conveyor: как запускать несколько независимых экземпляров на разных доменах, с отдельными БД и `.env`, какие шаги нужно выполнить при развертывании нового инстанса.

## Solution
Каждый экземпляр Landing Conveyor разворачивается как отдельное Node.js/Next.js‑приложение с собственным `.env` и отдельной базой данных MySQL/MariaDB. Инстансы могут работать на разных доменах (например, `cinopad.store`, `topcina.store`), полностью изолируя данные и конфигурацию. Деплой выполняется через Docker Compose или систему на базе `npm + pm2/systemd` за Nginx‑прокси с HTTPS.

## Details

### Общие принципы многодоменности

- **Отдельный `.env` для каждого домена**:
  - разные `DATABASE_URL`,
  - разные `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL`,
  - свои ключи CS-Cart/KeyCRM (если CRM‑интеграции тоже разделены).
- **Отдельная БД/схема**:
  - для каждого домена — собственная БД, напр.:
    - `landing_conveyor_cinopad`,
    - `landing_conveyor_topcina`.
- **Изоляция файлов**:
  - медиафайлы (`public/uploads`, `public/video`) относятся к конкретному инстансу;
  - при полном клонировании можно скопировать и их, но это уже операционное решение.

### Список ключевых ENV‑переменных

Полный пример — в `.env.example`. Основные группы:

- **База данных**
  - `DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB_NAME"`
- **Auth / Admin**
  - `ADMIN_EMAIL` — логин администратора.
  - `ADMIN_PASSWORD` — пароль администратора (для первичного сидинга).
  - `NEXTAUTH_SECRET` / `JWT_SECRET` — секрет подписи токенов.
  - `NEXTAUTH_URL` — URL приложения (например, `https://topcina.store`).
  - `NEXT_PUBLIC_APP_URL` — публичный URL (используется на фронте).
- **CS-Cart интеграция**
  - `CSCART_PHP_WEBHOOK_URL`
  - `CSCART_PHP_WEBHOOK_SECRET`
  - `CSCART_API_URL`
  - `CSCART_API_TOKEN`
  - `LEAD_DELIVERY_MODE` — `cscart_api` или `webhook`.
  - `LEAD_RETRY_SECRET` — секрет для `/api/leads/retry`.
- **KeyCRM интеграция**
  - `KEYCRM_API_KEY`
  - `KEYCRM_DEFAULT_SOURCE_ID`
  - `KEYCRM_DEFAULT_MANAGER_ID`

### Чеклист деплоя нового экземпляра

1. **Подготовка сервера**
   - Установить:
     - Node.js (совместимую версию, например 18+).
     - npm.
     - (опционально) Docker + Docker Compose.
     - Nginx (или другой HTTP‑сервер) для reverse proxy.

2. **Клонирование кода**
   - Создать директорию для приложения, например `/home/{user}/app`.
   - Выполнить:
     - `git clone https://github.com/<user>/Landing-Conveyor.git app`
     - `cd app/project`

3. **Создание `.env`**
   - Скопировать `.env.example` → `.env`.
   - Заполнить:
     - `DATABASE_URL` (новая БД).
     - `NEXTAUTH_SECRET` / `JWT_SECRET` (случайная строка).
     - `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` (новый домен).
     - `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
     - CS-Cart и KeyCRM ключи по необходимости.

4. **Подготовка БД**
   - Создать БД:
     - `CREATE DATABASE landing_conveyor_<instance> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - Прописать имя БД в `DATABASE_URL` в `.env`.

5. **Установка зависимостей и миграций**
   - `npm install`
   - `npx prisma migrate deploy` (или `prisma migrate dev` на dev‑окружении).
   - (опционально) `npm run seed` — заполнение демо‑данными.

6. **Сборка и запуск**
   - `npm run build`
   - Запуск:
     - через `npm start` (временно),
     - или через `pm2`:
       - `npm install -g pm2`
       - `pm2 start npm --name landing-conveyor -- start`
       - `pm2 save`
     - или через `systemd` с использованием `landing-conveyor.service.example`.

7. **Настройка Nginx/HTTPS**
   - Пример server‑блока:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

   - Для HTTPS:
     - настроить сертификат (Let's Encrypt/Certbot),
     - добавить `listen 443 ssl;` и ssl‑директивы.

### Клонирование для нового домена

Если уже есть один рабочий инстанс (например, `cinopad.store`), для запуска второго (`topcina.store`) делаем:

1. **Копия кода**
   - либо новое `git clone` в другую директорию,
   - либо другой server‑блок, если одна и та же сборка обслуживает несколько доменов (не рекомендуется при разных БД/CRM).

2. **Отдельный `.env`**
   - Новый файл `.env` с:
     - другим `DATABASE_URL`,
     - другим `NEXT_PUBLIC_APP_URL`/`NEXTAUTH_URL`,
     - своими CRM‑ключами.

3. **Отдельная БД**
   - создать новую БД (см. выше),
   - применить миграции и seed, если нужно.

4. **Отдельный процесс Node/порт**
   - запустить второй процесс приложения на другом порту (например, 3001),
   - настроить второй server‑блок Nginx, проксирующий домен → порт 3001.

### Конфигурация CORS

В стандартной конфигурации приложение работает как монолит (фронт + бэк на одном домене), поэтому CORS‑настройки минимальны. Если API вызывается с других доменов:

- нужно явно указать допустимые источники в middleware/headers (см. `README.md` и `nginx.conf.example`);
- не допускать `Access-Control-Allow-Origin: *` для приватных админ‑API.

### Отличия между экземплярами

- **Домены**:
  - `NEXT_PUBLIC_APP_URL` и Nginx‑конфиги различаются.
- **Базы данных**:
  - разные `DATABASE_URL` → полностью независимые данные (лендинги, leads, файлы).
- **CRM‑интеграции**:
  - разные CS-Cart/KeyCRM ключи и конфиги:
    - один инстанс может работать только с CS-Cart,
    - другой — с KeyCRM или другим магазином.
- **Env‑секреты**:
  - секреты (JWT, retry, webhook) должны быть различными между инстансами.

### Edge cases

- **Смешивание БД**:
  - использование одного и того же `DATABASE_URL` для двух инстансов приведёт к смешиванию лендингов и заявок;
  - важно строго разделять окружения.
- **Обновление кода**:
  - при изменениях в схеме/логике нужно:
    - деплоить обе инстанции,
    - прогонять миграции в каждой БД.
- **Миграция данных между инстансами**:
  - при переносе лендингов с одного домена на другой:
    - нужно экспортировать/импортировать данные (см. скрипты `prisma/export-*` и `prisma/import-*`),
    - пересоздавать/копировать медиафайлы.

