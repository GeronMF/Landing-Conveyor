## Goal
Описать модуль заявок (Leads): как и где хранятся все входящие заявки, как они отображаются и фильтруются в админке, и как связаны со статусами доставки в внешние CRM.

## Solution
Все заявки, приходящие с лендингов, записываются в единую таблицу `Lead` независимо от того, в какую CRM они дальше отправляются. Модуль `Leads` предоставляет админский интерфейс `/admin/leads` для просмотра заявок с фильтром по статусу (`new/sent/failed`) и базовый API `/api/admin/leads*` для выборки, пагинации и ретраев. Отправка в CRM и обновление статуса лида осуществляется модулем диспетчеризации (`OrderDispatcher`), но фактическое состояние всегда отражено в таблице `Lead`.

## Details

### Схема БД: таблица `Lead`

См. также `03-order-form` и `04-order-dispatch`; здесь кратко:

```text
model Lead {
  id             String     @id @default(uuid())
  landingId      String
  variantId      String?

  name           String
  phone          String
  city           String?
  comment        String?    @db.Text

  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmContent     String?
  utmTerm        String?
  gclid          String?
  fbclid         String?
  pageUrl        String?
  referer        String?
  userAgent      String?    @db.Text
  ip             String?

  status         LeadStatus @default(new)   // new | sent | failed
  csCartResponse Json?

  createdAt      DateTime   @default(now())

  landing Landing  @relation(fields: [landingId], references: [id], onDelete: Cascade)
  variant Variant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@index([landingId])
  @@index([variantId])
  @@index([status])
  @@index([createdAt])
}
```

### Статусы заявок

- `new` — заявка создана, но ещё не доставлена в CRM или отправка выполняется асинхронно.
- `sent` — заявка успешно доставлена в CRM (CS-Cart/KeyCRM).
- `failed` — произошла ошибка при доставке (некорректная конфигурация, ошибка API, сетевой таймаут и т.п.).

Переходы статусов осуществляет диспетчер заявок (см. `04-order-dispatch`).

### API: админ‑маршруты для Leads

Маршруты находятся под `app/api/admin/leads*`.

- **GET `/api/admin/leads`**
  - Назначение: вернуть список заявок с возможностью пагинации и фильтрации по статусу/лендингу/дате.
  - Параметры (типичный набор, может отличаться по реализации):
    - `status` — `new` | `sent` | `failed` (опционально).
    - `page`, `pageSize` — параметры пагинации.
    - `landingId` — фильтр по лендингу (опционально).
  - Ответ:
    - массив объектов Lead (часто с join на Landing/Variant для отображения названий),
    - метаданные пагинации (total, page, pageSize).

- **GET `/api/admin/leads/[id]`** (если реализовано)
  - Назначение: получить подробную информацию по одной заявке.

- **POST `/api/admin/leads/[id]/retry`** или обёртка над `/api/leads/retry`
  - Назначение: инициировать повторную отправку заявки в CRM.
  - Может быть реализовано как:
    - отдельный роут,
    - или фронтенд‑обёртка над публичным `/api/leads/retry?secret=...&leadId=...`.

### Публичный retry‑маршрут

Для сервисных задач существует:

- **POST `/api/leads/retry?secret=...&leadId=...`**
  - Проверяет `LEAD_RETRY_SECRET`.
  - Находит `Lead` по `leadId` с включением `landing` и `variant`.
  - Вызывает `dispatchLead(lead)`.
  - Обновляет `status` и `csCartResponse` аналогично первичной отправке.

Это позволяет:

- ретраить заявки, упавшие в статус `failed`,
- интегрировать cron/job‑скрипты для автоматического ретрая.

### Отображение в Admin UI

Страница `/admin/leads` (см. компоненты в `app/admin/leads/page.tsx`):

- Таблица с колонками:
  - имя (`name`),
  - телефон (`phone`),
  - лендинг (по `landing.slug` или `pageTitle`),
  - вариант (`variant.title`, если есть),
  - статус (`new/sent/failed`),
  - дата создания (`createdAt`).
- Фильтрация:
  - по статусу (`select` или `tabs`),
  - возможно, по поиску/slug лендинга.
- Действия:
  - просмотр детали заявки,
  - повторная отправка (кнопка retry) для статуса `failed` (если реализовано в UI).

### Edge cases и рекомендации

- **Хранение ошибок внешних систем**:
  - поле `csCartResponse` используется не только для CS-Cart, но и для KeyCRM (как общий JSON‑лог ответа/ошибки).
  - важно не раздувать это поле слишком большими payload‑ами (например, логами целых HTML‑страниц).
- **Удаление лендинга/варианта**:
  - при удалении `Landing` все его `Lead` удаляются (onDelete: Cascade);
  - при удалении `Variant` у связанных `Lead` `variantId` сбрасывается в `null` (onDelete: SetNull).
  - если нужно сохранять историю по старым лидам, связанные сущности должны удаляться аккуратно.
- **Фильтрация по времени**:
  - часто бизнесу нужны отчёты за период (день/неделя/месяц) — индексы по `createdAt` уже есть, надо только корректно использовать их в запросах.
- **Массовый retry**:
  - при большом количестве `failed` заявок возможна нагрузка на внешние CRM при массовом ретрае;
  - рекомендуется:
    - вводить ограничение по количеству одновременных ретраев,
    - либо реализовать очередь задач с rate‑лимитом.
- **Личное/чувствительное содержимое комментариев**:
  - поле `comment` может содержать персональные данные; в логах и мониторинге желательно избегать прямой печати полного текста.

