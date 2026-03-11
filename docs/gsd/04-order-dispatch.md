## Goal
Объяснить устройство и поведение модуля диспетчеризации заявок (Order Dispatch): как заявки из лендингов маршрутизируются в разные внешние CRM/магазины (CS-Cart, KeyCRM) без изменения логики самих лендингов и форм.

## Solution
Модуль использует паттерн **Adapter/Strategy**: есть единая точка входа `dispatchLead(lead)` в `lib/order-dispatcher.ts`, которая выбирает конкретный адаптер на основе поля `orderDestination` у лендинга. Сейчас доступны два адаптера:

- `CsCartAdapter` — отправка заказа в CS-Cart (через PHP‑webhook и/или REST API).
- `KeyCrmAdapter` — отправка заказа в KeyCRM (`POST https://openapi.keycrm.app/v1/order`).

Сами лендинги и форма заказа ничего не знают о конкретной CRM — они просто создают `Lead` в БД, а диспетчер отвечает за доставку и обновление статуса `Lead`.

## Details

### Архитектура модуля и интерфейс адаптера

Логика диспетчера сосредоточена в файле `lib/order-dispatcher.ts`.

Высокоуровневый интерфейс адаптера:

```text
interface IOrderAdapter {
  send(lead, variant, landingConfig) => {
    ok: boolean;
    externalOrderId?: string | number | null;
    raw?: any;
    error?: string;
  }
}
```

В коде это реализовано функциями:

- `async function sendToCsCart(lead): Promise<DispatchResult>`
- `async function sendToKeyCrm(lead): Promise<DispatchResult>`
- `export async function dispatchLead(lead): Promise<DispatchResult>`

Где:

```text
type Destination = 'cs_cart' | 'keycrm';

interface DispatchResult {
  ok: boolean;
  destination: Destination;
  externalOrderId?: string | number | null;
  raw?: any;
  error?: string;
}
```

### Flow заявки (flowchart / псевдокод)

Псевдокод полного потока `submit → lead → CRM → статус`:

```text
// Публичный API: POST /api/leads

handleCreateLead(request):
  ip = extractIp(request)
  if !checkRateLimit(ip):
    return 429 Too Many Requests

  data = validateWithZod(request.body)

  // Honeypot anti-spam
  if data.honeypot is not empty:
    return { success: true }    // молча игнорируем бота

  // 1. Создаём Lead со статусом 'new'
  lead = db.lead.create({
    landingId: data.landingId,
    variantId: data.variantId,
    name: data.name,
    phone: data.phone,
    city: data.city,
    comment: data.comment,
    utm..., clickIds..., pageUrl, referer, userAgent, ip,
    status: 'new'
  }, include: { landing, variant })

  // 2. Отправляем в CRM через диспетчер
  result = dispatchLead(lead)

  // 3. Обновляем статус и лог внешнего ответа
  db.lead.update({
    where: { id: lead.id },
    data: {
      status: result.ok ? 'sent' : 'failed',
      csCartResponse: result.raw ?? (result.error ? { error: result.error } : undefined)
    }
  })

  return { success: true, leadId: lead.id }
```

Псевдокод самого диспетчера:

```text
dispatchLead(lead):
  landing = lead.landing

  if landing.orderDestination == 'keycrm':
    return sendToKeyCrm(lead)
  else:
    return sendToCsCart(lead)
```

### CsCartAdapter (отправка в CS-Cart)

Реализован в `lib/cscart.ts`, используется из `sendToCsCart`.

#### Конфигурация

ENV‑переменные:

- `CSCART_PHP_WEBHOOK_URL`
- `CSCART_PHP_WEBHOOK_SECRET`
- `CSCART_API_URL`
- `CSCART_API_TOKEN`

Модуль `createCsCartOrder(payload)` сам решает, какой режим использовать:

1. **PHP webhook** (рекомендуется, если нет REST API):
   - если заданы `CSCART_PHP_WEBHOOK_URL` и `CSCART_PHP_WEBHOOK_SECRET`,
   - отправляется запрос на PHP‑скрипт на стороне CS-Cart.
2. **REST API**:
   - если заданы `CSCART_API_URL` и `CSCART_API_TOKEN` (`email:api_key`),
   - создаётся заказ через REST API CS-Cart.

#### Payload и маппинг полей

В `sendToCsCart`:

- Из `Lead` и `Variant` собираются:
  - `firstname` — `lead.name`.
  - `phone` — `lead.phone`.
  - `productId` — `variant.cscartProductId` (обязателен для CS-Cart).
  - `notes` — строка с собранной информацией (landing slug, вариант, город, комментарий, UTM, click IDs, URL).
- `buildOrderNotes(...)` формирует человекочитаемые заметки:
  - `Лендинг: [slug]`
  - `Варіант: [title]`
  - `Місто: [city]`
  - `Коментар: [comment]`
  - `UTM: source=..., medium=..., campaign=...`
  - `gclid=...`, `fbclid=...`, `URL: ...`

Ответ CS-Cart:

- Если заказ успешно создан — возвращается `ok: true`, `orderId`, `raw` с полным ответом.
- Иначе — `ok: false`, `error` с сообщением/HTTP‑статусом, `raw` с телом ответа (если есть).

#### Обработка ошибок и edge cases

- Если у варианта **нет** `cscartProductId`:
  - в текущей версии диспетчер возвращает `ok: false, error: 'Variant has no cscartProductId configured'`,
  - lead помечается как `failed`.
  - В старой логике (в `POST /api/leads` до рефакторинга) в этом случае допускалось `success=true` без отправки — важно понимать этот нюанс при миграции.
- Если CS-Cart не сконфигурирован (нет ни PHP, ни API URL/ключа) — `createCsCartOrder` вернёт `ok: false` с сообщением `'CS-Cart not configured...'`.
- Сетевые ошибки/исключения:
  - ловятся на уровне `createCsCartOrder`,
  - возвращается `ok: false`, `error: 'Network error'` или текст исключения.

### KeyCrmAdapter (отправка в KeyCRM)

Реализован в `sendToKeyCrm` в `lib/order-dispatcher.ts`.

#### Конфигурация

Источники конфигурации (приоритет сверху вниз):

- На уровне лендинга (`Landing`):
  - `orderDestination` — должен быть `keycrm`.
  - `keycrmApiKey` — API‑ключ **для данного лендинга** (может быть пустым, тогда используется глобальный).
  - `keycrmSourceId` — ID источника в KeyCRM.
  - `keycrmManagerId` — ID менеджера (опционально).
- Глобальные ENV:
  - `KEYCRM_API_KEY`
  - `KEYCRM_DEFAULT_SOURCE_ID`
  - `KEYCRM_DEFAULT_MANAGER_ID`

Алгоритм выбора:

- `apiKey = landing.keycrmApiKey || process.env.KEYCRM_API_KEY`
- `sourceId = landing.keycrmSourceId ?? KEYCRM_DEFAULT_SOURCE_ID`
- `managerId = landing.keycrmManagerId ?? KEYCRM_DEFAULT_MANAGER_ID`

#### Payload и маппинг полей

KeyCRM API: `POST https://openapi.keycrm.app/v1/order`

Тело запроса:

```json
{
  "source_id": 123,
  "manager_id": 456,
  "buyer": {
    "full_name": "Ім'я Клієнта",
    "phone": "+380..."
  },
  "buyer_comment": "Коментар з форми",
  "products": [
    {
      "sku": "WINTER_SUIT_RED_M",
      "price": 1499,
      "quantity": 1,
      "name": "Зимовий костюм, червоний, M"
    }
  ]
}
```

Маппинг:

- `source_id` — `landing.keycrmSourceId` или `KEYCRM_DEFAULT_SOURCE_ID`.
- `manager_id` — `landing.keycrmManagerId` или `KEYCRM_DEFAULT_MANAGER_ID` (опционален).
- `buyer.full_name` — `lead.name`.
- `buyer.phone` — `lead.phone`.
- `buyer_comment` — `lead.comment`.
- `products[0].sku` — `variant.keycrmOfferSku`.
- `products[0].price` — `Number(variant.price)` (если нет цены — 0).
- `products[0].name` — `variant.title` или `landing.pageTitle` или `landing.slug`.

#### Ограничения и лимиты

- KeyCRM указывает лимиты `~60 запросов в минуту` (в документации). В текущей реализации:
  - явного rate‑лимитинга на уровне KeyCRM нет,
  - но есть базовый rate‑лимит на входящие заявки (`POST /api/leads`) по IP (5 запросов в минуту).
  - При необходимости отдельный rate‑лимит на KeyCRM можно добавить в будущем (например, через in‑memory счётчик или внешнее хранилище).

#### Обработка ошибок

- Если нет `apiKey`:
  - лог: `KeyCRM API key not configured (...)`,
  - `ok: false`, `error` с текстом.
- Если нет `sku` у варианта:
  - лог: `keycrmOfferSku is not configured on variant`,
  - `ok: false`.
- Если нет `source_id`:
  - лог: `keycrmSourceId not configured (...)`,
  - `ok: false`.
- HTTP‑ошибки KeyCRM:
  - читается JSON‑ответ, пытаемся взять `data.message` или `data.error`,
  - если не получилось — используем `KeyCRM HTTP {status}`.
  - всё пишется в лог и возвращается как `error` + `raw`.
- Сетевые ошибки:
  - ловятся в `catch`,
  - логируется `KeyCRM network error for lead ...`,
  - `ok: false`, `error: 'KeyCRM network error'` или текст исключения.

### Обновление статуса Lead и хранение ответа

Модель `Lead` (часть, относящаяся к статусу/ответу):

```text
model Lead {
  id             String     @id @default(uuid())
  landingId      String
  variantId      String?
  name           String
  phone          String
  city           String?
  comment        String?    @db.Text
  ...
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

Логика обновления:

- После вызова `dispatchLead`:
  - если `result.ok === true`:
    - `status = 'sent'`,
    - `csCartResponse = result.raw` (JSON‑ответ от внешней системы).
  - если `result.ok === false`:
    - `status = 'failed'`,
    - `csCartResponse = result.raw ?? { error: result.error }`.

Таким образом, **все заявки всегда хранятся локально** в `Lead`, даже если внешняя CRM недоступна — это позволяет повторно отправить их позже.

### Retry‑логика

Для ручного/сервисного ретрая используется отдельный endpoint:

- **POST `/api/leads/retry?secret=...&leadId=...`**
  - проверяет `LEAD_RETRY_SECRET`,
  - находит `Lead` по `leadId` (с включением `landing`, `variant`),
  - вызывает `dispatchLead(lead)`,
  - обновляет `status` и `csCartResponse` аналогично основному потоку.

Это позволяет:

- отражать упавшие заявки со статусом `failed` в админке (см. модуль Leads),
- триггерить повторную отправку скриптом/cron‑джобой.

### Edge cases и рекомендации

- **Неполная конфигурация канала**:
  - Если для `orderDestination = keycrm` не заполнены `apiKey`, `sourceId` или `sku`, заявки будут создаваться, но уходить в статус `failed`.
  - Рекомендуется:
    - либо валидировать конфиг лендинга в админке (подсветка ошибок),
    - либо не давать переключать `orderDestination` на `keycrm` без обязательных полей.
- **Смена канала доставки на работающем лендинге**:
  - При смене `orderDestination` c `cs_cart` на `keycrm`:
    - новые заявки пойдут в KeyCRM,
    - старые заявки в CS-Cart не меняются.
  - Важно документировать эту смену для бизнеса (какие заявки где искать).
- **Rate limiting на внешние системы**:
  - При очень высоком трафике возможно превышение лимитов KeyCRM / CS-Cart.
  - В текущей версии базовый rate‑лимит только на входящие запросы (`/api/leads`).
  - Для проектов с большим трафиком стоит рассмотреть:
    - очередь заявок,
    - worker‑процесс для отправки в фоновых задачах,
    - управление скоростью отправки в каждую CRM.
- **Расширяемость**:
  - Добавление новых CRM:
    - реализуется через новую функцию‑адаптер (`sendToXxxCrm`),
    - расширение enum `OrderDestination`,
    - обновление `dispatchLead` с новым `case`.
  - Важно держать маппинг полей и обработку ошибок полностью инкапсулированными в адаптере.

