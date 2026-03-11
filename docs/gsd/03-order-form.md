## Goal
Описать модуль формы заказа: как настраиваются поля формы, как происходит приём заявок от посетителей лендинга и их жизненный цикл от отправки до доставки в CRM.

## Solution
Форма заказа конфигурируется на уровне лендинга через JSON‑поле `formConfig`, редактируемое в админке на вкладке «Форма замовлення». Публичный роут `POST /api/leads` принимает данные формы (динамический набор полей + метаданные трафика), валидирует их, создаёт запись `Lead` в БД и передаёт её в модуль диспетчеризации заявок (`OrderDispatcher`), который отправляет её в выбранную CRM (CS-Cart или KeyCRM) и обновляет статус лида.

## Details

### Схема БД: таблица `Lead`

Фрагмент `prisma/schema.prisma`:

```text
model Lead {
  id             String     @id @default(uuid())
  landingId      String
  variantId      String?

  name           String
  phone          String
  city           String?
  comment        String?    @db.Text

  // UTM и аналитика
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

enum LeadStatus {
  new
  sent
  failed
}
```

Каналы доставки (`orderDestination`, `OrderDestination`) описаны в модуле лендингов и используются диспетчером заявок.

### Конфигурация формы заказа (`formConfig`)

Поле `Landing.formConfig` хранит JSON‑конфигурацию формы:

```text
formConfig: {
  title: string
  titleRu?: string
  subtitle?: string
  subtitleRu?: string
  buttonText?: string
  buttonTextRu?: string
  successTitle?: string
  successTitleRu?: string
  successText?: string
  successTextRu?: string
  fields: [
    {
      name: 'name' | 'phone' | 'city' | 'comment'
      label: string
      labelRu?: string
      placeholder?: string
      placeholderRu?: string
      required: boolean
      visible: boolean
    },
    ...
  ]
}
```

Настройка происходит через компонент `FormConfigEditor` на вкладке «Форма замовлення» в `/admin/landings/[id]`.

Основная идея:

- набор полей фиксированный по именам (`name`, `phone`, `city`, `comment`), но:
  - каждое поле можно скрыть (`visible=false`),
  - сделать необязательным (`required=false`),
  - задать подписи и плейсхолдеры для UK/RU.
- внешний вид (заголовки, подписи, текст успеха) тоже конфигурируются.

### API‑маршрут приёма заявок

#### `POST /api/leads`

- **Назначение**: публичный endpoint для приёма заявок с лендингов.
- **Тело запроса (после маппинга с формы)**:

```json
{
  "landingId": "uuid-лендинга",
  "variantId": "uuid-варианта (опционально)",
  "name": "Имя",
  "phone": "+380...",
  "city": "Город (опционально)",
  "comment": "Комментарий (опционально)",
  "utmSource": "...",
  "utmMedium": "...",
  "utmCampaign": "...",
  "utmContent": "...",
  "utmTerm": "...",
  "gclid": "...",
  "fbclid": "...",
  "pageUrl": "https://...",
  "referer": "https://...",
  "honeypot": ""   // скрытое поле для anti-spam
}
```

- **Валидация (Zod)**:
  - `landingId: string`
  - `variantId?: string`
  - `name: string.min(2)`
  - `phone: string.min(10)`
  - `city?: string`
  - `comment?: string`
  - UTM/Click IDs/URL — опциональные строки.

- **Антиспам и rate limiting**:
  - `honeypot` — если не пуст, заявка игнорируется, но возвращается `{ success: true }`.
  - Внутренний rate‑лимитер на IP:
    - не более 5 запросов в минуту;
    - при превышении → HTTP 429.

- **Жизненный цикл заявки**:

1. **Создание лида** (`status = 'new'`)
   - `db.lead.create` с полями формы и аналитикой.
2. **Диспетчеризация**:
   - `dispatchLead(lead)` выбирает адаптер (CS-Cart / KeyCRM) по `landing.orderDestination`.
3. **Обновление статуса**:
   - при успехе внешней системы:
     - `status = 'sent'`,
     - `csCartResponse = raw response`.
   - при ошибке:
     - `status = 'failed'`,
     - `csCartResponse = raw || { error: message }`.
4. **Ответ клиенту**:
   - `200 OK`, `{ success: true, leadId }` — даже если внешняя CRM недоступна, чтобы не ломать фронт (ошибки логируются внутри).

### Связь с модулем Leads и диспетчером

- Все заявки попадают в таблицу `Lead` и отображаются в модуле `Leads` (админка `/admin/leads`).
- Статусы:
  - `new` — только что создана, отправка в CRM ещё не завершена или не выполняется.
  - `sent` — успешно отправлена в CRM.
  - `failed` — ошибка отправки, требуется внимание/ретрай.
- Повторная отправка:
  - через `POST /api/leads/retry?secret=...&leadId=...` или соответствующий админ‑интерфейс для ретрая.

### Edge cases и поведение формы

- **Незаполненные необязательные поля**:
  - `city` и `comment` допускают `null/undefined`, БД хранит `null` или пустую строку.
  - отображение на лендинге и в интеграциях должно учитывать отсутствие значений.
- **Несогласованность `landingId` и `variantId`**:
  - если `variantId` указывает на вариант другого лендинга, это логическая ошибка; рекомендуется:
    - валидировать, что выбранный вариант принадлежит указанному лендингу,
    - либо маппить `variantId` только из клиентского UI, который уже привязан к конкретному лендингу.
- **Форма без `variantId`**:
  - если лендинг без вариантов или вариант не выбран:
    - `variantId = null`;
    - CS-Cart и KeyCRM адаптеры могут работать ограниченно (например, для CS-Cart без `cscartProductId` создаётся или не создаётся заказ в зависимости от логики адаптера).
- **Ошибка внешней CRM**:
  - фронт всегда получает `{ success: true }`, чтобы не показывать пользователю технические ошибки CRM;
  - в админке заявка будет иметь статус `failed` и подробности в `csCartResponse`.
- **Изменение конфигурации формы**:
  - если скрыть или сделать необязательным поле, а фронт всё ещё его отправляет — бэкенд примет, но может проигнорировать лишние поля;
  - важно держать фронтенд и конфиг формы синхронизированными.

