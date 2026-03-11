## Goal
Описать модуль вариантов товара: как один лендинг может содержать несколько SKU, как устроены вложенные блоки (галерея, видео, преимущества, характеристики, таблицы размеров, отзывы) и как это всё хранится в БД и управляется через API/админку.

## Solution
Каждый вариант товара представлен сущностью `Variant`, связанной с `Landing` отношением 1:N. Вариант содержит базовые коммерческие поля (название, цены, валюта, CTA‑кнопки, телефон, ID товара в CS-Cart, SKU в KeyCRM), а также набор вложенных блоков: галерея, видео, преимущества, характеристики, таблицы размеров, отзывы. CRUD для вариантов реализован через `app/api/admin/variants*`, а редактирование — через компонент `VariantEditor` в админке.

## Details

### Схема БД: таблица `Variant` и связанные сущности

Фрагмент `prisma/schema.prisma`:

```text
model Variant {
  id                    String   @id @default(uuid())
  landingId             String
  order                 Int      @default(0)
  title                 String
  titleRu               String?
  subtitle              String?  @db.Text
  subtitleRu            String?  @db.Text
  offerText             String?  @db.Text
  offerTextRu           String?  @db.Text
  badgeText             String?
  badgeTextRu           String?
  price                 Decimal  @db.Decimal(10, 2)
  oldPrice              Decimal? @db.Decimal(10, 2)
  currency              String   @default("UAH")

  ctaPrimaryText        String   @default("Замовити зараз")
  ctaPrimaryTextRu      String?
  ctaSecondaryPhoneText String?
  ctaSecondaryPhoneTextRu String?
  primaryPhone          String?

  economyText           String?
  economyTextRu         String?
  faqLinkText           String?
  faqLinkTextRu         String?

  heroImageUrl          String?

  videoUrl              String?
  videoUrlDesktop       String?
  videoHtmlDesktop      String?  @db.Text
  videoUrlMobile        String?
  videoHtmlMobile       String?  @db.Text
  videoTitle            String?
  videoTitleRu          String?
  videoText             String?  @db.Text
  videoTextRu           String?  @db.Text

  sizeTableHtml         String?  @db.LongText
  sizeTableHtmlRu       String?  @db.LongText

  specificationsBackgroundImage String?
  specificationsFixedBackground Boolean @default(false)

  repeatOfferBlocks     Int      @default(2)

  // Интеграция с внешними системами
  cscartProductId       String?  // ID товара в CS-Cart
  keycrmOfferSku        String?  // SKU товара в KeyCRM

  // JSON‑поля контента
  heroImages     Json?
  advantages     Json?
  specifications Json?
  sizeTable      Json?
  gallery        Json?
  reviews        Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  landing           Landing         @relation("oldVariants", fields: [landingId], references: [id], onDelete: Cascade)
  oldImages         VariantImage[]  @relation("oldImages")
  oldBenefits       Benefit[]       @relation("oldBenefits")
  oldSpecifications Specification[] @relation("oldSpecifications")
  oldSizeTables     SizeTable[]     @relation("oldSizeTables")
  oldReviews        Review[]        @relation("oldReviews")
  leads             Lead[]

  @@index([landingId])
  @@index([order])
}
```

Связанные сущности (`VariantImage`, `Benefit`, `Specification`, `SizeTable`, `SizeTableRow`, `Review`) описаны отдельными таблицами и используются либо напрямую, либо как legacy‑слой при переходе на HTML/JSON‑представление. Детали по таблицам размеров и отзывам дублируются в GSD‑документах соответствующих модулей.

Ключевые поля по ТЗ:

- Коммерческие:
  - `name (UK/RU)` → `title` / `titleRu`
  - `subtitle` / `subtitleRu`
  - `offer_text` → `offerText` / `offerTextRu`
  - `badge` → `badgeText` / `badgeTextRu`
  - `price`, `old_price`, `currency`
  - `cta_button` → `ctaPrimaryText` / `ctaPrimaryTextRu`
  - `phone` → `primaryPhone`
  - `cs_cart_product_id` → `cscartProductId`
  - `keycrm_offer_sku` → `keycrmOfferSku`
- Вложенные блоки:
  - `gallery` — `heroImages`, `gallery`, `VariantImage`.
  - `video` — `videoUrl*`, `videoHtml*`, `videoTitle`, `videoText`.
  - `benefits` — `advantages`, `Benefit`.
  - `specifications` — `specifications`, `Specification`.
  - `size_charts` — `sizeTableHtml`, `sizeTableHtmlRu`, `SizeTable`, `SizeTableRow`.
  - `reviews` — `reviews`, `Review`.

### API‑маршруты модуля вариантов

Админ‑маршруты находятся под `app/api/admin/variants*`.

- **GET `/api/admin/variants/[id]`**
  - Назначение: получить полный вариант для редактирования.
  - Включает:
    - все основные поля `Variant`,
    - связанные `oldImages`, `oldBenefits`, `oldSpecifications`, `oldSizeTables` (с `rows`), `oldReviews`.

- **PUT `/api/admin/variants/[id]`**
  - Назначение: обновить вариант.
  - Тело валидируется через `updateVariantSchema`:
    - все важные текстовые/коммерческие поля,
    - видео‑поля,
    - HTML таблиц размеров,
    - флаги фона характеристик,
    - `cscartProductId`,
    - `keycrmOfferSku`.
  - Особенности:
    - пустые строки по видео‑полям сбрасываются в `null`, чтобы блок не рендерился.
    - `price` и `oldPrice` приводятся к числу.

- **DELETE `/api/admin/variants/[id]`**
  - Назначение: удалить вариант (и каскадно связанные сущности).

- **POST `/api/admin/variants`**
  - Назначение: создать базовый вариант (используется кнопкой «Додати варіант» на странице лендинга).
  - Минимальный набор: `landingId`, `order`, `title`, `price`, `currency`.

- **POST `/api/admin/variants/[id]/duplicate`**
  - Назначение: продублировать существующий вариант со всем его контентом.

- Доп. маршруты для вложенных сущностей (подробно раскрываются в документах соответствующих модулей):
  - `/api/admin/variants/[id]/images`
  - `/api/admin/variants/[id]/benefits`
  - `/api/admin/variants/[id]/specifications`
  - `/api/admin/variants/[id]/size-tables`
  - `/api/admin/variants/[id]/reviews`

### Логика в Admin UI

- Страница редактирования лендинга `/admin/landings/[id]`:
  - вкладка **«Варіанти товару»** показывает список вариантов и кнопку «Додати варіант».
  - при выборе варианта открывается `VariantEditor`.
- `VariantEditor`:
  - вкладки: «Основне», «Галерея», «Відео», «Переваги», «Характеристики», «Таблиці розмірів», «Відгуки».
  - на вкладке «Основне» доступны:
    - все текстовые и коммерческие поля (название, подзаголовок, оффер, бейдж, цена, старая цена, валюта, CTA, телефон),
    - `ID товару CS-Cart` (`cscartProductId`),
    - `SKU товару в KeyCRM` (`keycrmOfferSku`),
    - тексты экономии и ссылки на FAQ.
  - при сохранении:
    - собирается объект `dataToSave`,
    - `id` варианта передаётся отдельно в URL `/api/admin/variants/[id]`.

### Edge cases и особенности

- **Мультиязычность**:
  - большинство текстовых полей имеют пару `*` / `*Ru`;
  - фронтенд должен корректно падать в fallback‑язык, если перевод отсутствует.
- **Цена и старая цена**:
  - `oldPrice` может быть `null` — в этом случае старая цена не отображается.
  - в админке важно не допускать NaN (используется `parseFloat` с fallback `0` или `null`).
- **Интеграция с CRM**:
  - для CS-Cart:
    - если `cscartProductId` не задан, заявка может быть сохранена локально, но заказ в CS-Cart не создаётся (см. модуль Order Dispatch).
  - для KeyCRM:
    - если `keycrmOfferSku` не задан, адаптер KeyCRM вернёт ошибку, а lead станет `failed`.
- **Удаление варианта**:
  - удаление связано с каскадным удалением `Lead.variant` (через `onDelete: SetNull`), таблиц размеров, отзывов и т.д.;
  - важно не удалять вариант, если на него продолжается активный трафик (иначе форма перестанет корректно маппиться на SKU).
- **Порядок вариантов (`order`)**:
  - влияет на порядок отображения на лендинге;
  - при удалении/добавлении желательно пересортировывать order, чтобы не было больших дыр/дубликатов (можно реализовать дополнительный сервис).

