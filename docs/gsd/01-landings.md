## Goal
Описать устройство и поведение модуля управления лендингами: как создавать, редактировать, публиковать и дублировать лендинги, как работает slug‑маршрутизация и preview‑режим.

## Solution
Каждый лендинг представлен сущностью `Landing` в БД и редактируется через админ‑панель `/admin/landings` и `/admin/landings/[id]`. Доступны CRUD‑операции, статусы `draft/published`, автоматическая и ручная генерация slug, а также превью по ссылке `/l/[slug]?preview=1`. Лендинг агрегирует общие блоки (SEO, FAQ, футер, секции страницы, форма заказа) и связан с вариантами товара.

## Details

### Схема БД: таблица `Landing`

Таблица описана в `prisma/schema.prisma`, Prisma‑модель:

```text
model Landing {
  id                 String           @id @default(uuid())
  slug               String           @unique
  status             LandingStatus    @default(draft)   // draft | published

  pageTitle          String?
  pageTitleRu        String?
  introText          String?          @db.Text
  introTextRu        String?          @db.Text
  globalFAQTitle     String           @default("FAQ")
  globalFAQTitleRu   String?

  seoTitle           String?
  seoTitleRu         String?
  seoDescription     String?          @db.Text
  seoDescriptionRu   String?          @db.Text
  ogImage            String?

  logoUrl            String?
  themeId            String?
  themePrimaryColor  String?
  themeAccentColor   String?

  companyName        String?
  companyNameRu      String?
  legalText          String?          @db.Text
  legalTextRu        String?          @db.Text
  privacyPolicyText  String?          @db.LongText
  privacyPolicyTextRu String?         @db.LongText
  termsText          String?          @db.LongText
  termsTextRu        String?          @db.LongText
  copyrightText      String?
  copyrightTextRu    String?
  phone              String?
  email              String?
  socials            Json?
  links              Json?

  // JSON‑поля по ТЗ
  heroImages   Json?  // [{url, alt}]
  variantsJson Json?  // [{id, name, slug, color, images}] (наследие старой схемы)
  faqsJson     Json?  // [{id, question, answer}]
  companyInfo  Json?  // {companyName, edrpou, legalAddress, ...}
  formConfig   Json?  // конфиг формы заказа
  ageVerification Boolean @default(false)

  // Секции страницы
  howToOrder   Json?  // секция "Як замовити"
  delivery     Json?  // секция "Доставка та оплата"

  // Настройки канала доставки заявок
  orderDestination OrderDestination @default(cs_cart)  // cs_cart | keycrm
  keycrmApiKey     String?          @db.Text
  keycrmSourceId   Int?
  keycrmManagerId  Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Связи
  oldVariants Variant[] @relation("oldVariants")
  oldFaqs     FAQ[]     @relation("oldFaqs")
  leads       Lead[]
  theme       Theme?    @relation(fields: [themeId], references: [id], onDelete: SetNull)

  @@index([slug])
  @@index([status])
  @@index([themeId])
}
```

Дополнительные типы:

```text
enum LandingStatus {
  draft
  published
}

enum OrderDestination {
  cs_cart
  keycrm
}
```

### Основные поля и их роль

- **Идентификация и статус**
  - `id` — UUID лендинга.
  - `slug` — уникальный slug, используемый в публичном URL (`/l/[slug]`).
  - `status` — текущее состояние (`draft` или `published`).
- **Контент и мультиязычность**
  - `pageTitle` / `pageTitleRu` — H1 заголовок страницы.
  - `introText` / `introTextRu` — вводный текст.
  - `globalFAQTitle` / `globalFAQTitleRu` — заголовок секции FAQ.
  - SEO: `seoTitle`, `seoTitleRu`, `seoDescription`, `seoDescriptionRu`, `ogImage`.
- **Оформление / тема**
  - `logoUrl`, `themeId`, `themePrimaryColor`, `themeAccentColor`.
- **Информация о компании / футер**
  - `companyName`, `companyNameRu`, `legalText`, `legalTextRu`.
  - `privacyPolicyText`, `privacyPolicyTextRu`, `termsText`, `termsTextRu`.
  - `copyrightText`, `copyrightTextRu`.
  - Контакты: `phone`, `email`, `socials`, `links`.
- **JSON‑секции**
  - `heroImages` — массив изображений для hero‑блока.
  - `howToOrder` — секция «Як замовити» (заголовок, название товара, шаги).
  - `delivery` — секция «Доставка та оплата» (заголовок, текст, список перевозчиков, промо‑тексты, условия оплаты).
  - `formConfig` — конфиг формы заказа (см. GSD‑документ `03-order-form`).
- **Канал доставки заявок**
  - `orderDestination` — `cs_cart` или `keycrm`.
  - `keycrmApiKey` / `keycrmSourceId` / `keycrmManagerId` — настройки KeyCRM для данного лендинга (могут перекрывать глобальные ENV).

### API‑маршруты модуля Landings

#### Admin API

- **GET `/api/admin/landings`**
  - Описание: список лендингов с пагинацией/фильтрацией (имплементация может варьироваться).
  - Использование: экран `/admin/landings`.

- **POST `/api/admin/landings`**
  - Описание: создание нового лендинга (минимум slug + базовые поля).
  - Тело (примерно):
    - `slug: string`
    - `pageTitle?: string`
    - `status?: 'draft' | 'published'`
  - Ответ: созданный `Landing`.

- **GET `/api/admin/landings/[id]`**
  - Описание: получение детальных данных лендинга по `id` с подгрузкой связанных сущностей.
  - Включает:
    - `oldVariants` с их контентом (галерея, преимущества, характеристики, таблицы размеров, отзывы).
    - `oldFaqs`.

- **PUT `/api/admin/landings/[id]`**
  - Описание: обновление полей лендинга.
  - Тело валидации (`updateLandingSchema` в `app/api/admin/landings/[id]/route.ts`):
    - основные поля контента/SEO/футера,
    - JSON‑поля `heroImages`, `faqsJson`, `companyInfo`, `formConfig`, `howToOrder`, `delivery`,
    - поля канала доставки заявок:
      - `orderDestination: 'cs_cart' | 'keycrm'`
      - `keycrmApiKey?: string | null`
      - `keycrmSourceId?: number | null`
      - `keycrmManagerId?: number | null`
  - Особенности:
    - Проверка уникальности `slug` (ошибка Prisma `P2002` → HTTP 409).
    - Валидация Zod, ошибки → HTTP 400.

- **DELETE `/api/admin/landings/[id]`**
  - Описание: удаление лендинга и связанных сущностей (варианты, FAQ, leads — в зависимости от настроек внешних ключей).

- **POST `/api/admin/landings/[id]/duplicate`**
  - Описание: дублирование лендинга (slug изменяется, контент копируется, статус обычно `draft`).
  - Копируются:
    - базовые поля лендинга,
    - варианты товара (с их структурой),
    - FAQ и секции страницы.

#### Публичные маршруты

- **GET `/l/[slug]`**
  - Описание: публичный просмотр опубликованного лендинга.
  - Поведение:
    - отрисовывает лендинг по slug;
    - если `status = draft`, по умолчанию может быть недоступен без превью‑флага (зависит от реализации страницы).

- **GET `/l/[slug]?preview=1`**
  - Описание: preview‑режим для драфтов (например, по секретной ссылке из админки).
  - Использование: кнопка **Preview** в `/admin/landings/[id]`.

### Правила генерации и использования slug

- При создании лендинга slug:
  - либо задаётся вручную,
  - либо может быть сгенерирован на основе названия (transliteration + `-`).
- Требования:
  - только латинские буквы, цифры, дефисы (рекомендуется);
  - уникальность — Prisma гарантирует через `@unique`, попытка создать дубликат → HTTP 409.
- Edge cases:
  - смена slug на уже занятый должна отдавать понятную ошибку администратору;
  - при смене slug старый URL перестаёт работать — если требуется 301/редиректы, это нужно закладывать на уровне Nginx/маршрутов отдельно.

### Логика статусов и публикации

- **Статусы:**
  - `draft` — черновик, не предназначен для публичного трафика.
  - `published` — опубликован, может получать трафик.
- **Админ‑действия:**
  - на странице `/admin/landings/[id]` есть кнопка Publish/Unpublish:
    - меняет `status` через `PUT /api/admin/landings/[id]`.
- **Edge cases:**
  - если лендинг `draft`, но на него уже ссылается рекламная кампания — пользователи могут увидеть пустую/ошибочную страницу. Рекомендуется:
    - сначала протестировать превью (`?preview=1`),
    - только потом переключать в `published`.

### Мультиязычность (UK/RU)

- На уровне лендинга все ключевые текстовые поля дублируются:
  - `pageTitle` / `pageTitleRu`
  - `introText` / `introTextRu`
  - `globalFAQTitle` / `globalFAQTitleRu`
  - SEO: `seoTitle` / `seoTitleRu`, `seoDescription` / `seoDescriptionRu`
  - юридический текст, копирайты и т.п.
- Рендеринг на лендинге:
  - язык определяется по настройкам (например, по query/куки/браузеру, детально смотрите модуль i18n),
  - если текст на выбранном языке пустой, используется fallback (обычно украинская версия).

### Edge cases для модуля Landings

- **Удаление лендинга с заявками**:
  - При удалении `Landing` с существующими `Lead` может возникнуть конфликт по внешним ключам:
    - сейчас relation настроен на `onDelete: Cascade` для `Lead.landing`, поэтому заявки также удаляются.
    - если нужна сохранность заявок — требуется изменить поведение (см. модуль Leads).
- **Темы и цвета**:
  - Если `themeId` не задан, используются `themePrimaryColor` / `themeAccentColor`.
  - Если и они не заданы — должны быть дефолтные цвета на фронтенде.
- **Секции `howToOrder` и `delivery`**:
  - если структуры пустые (нет шагов/заголовков) — секции скрываются.
  - нужно аккуратно валидировать JSON при сохранении через админку (иначе возможен крэш на рендере).
- **Канал доставки заявок**:
  - `orderDestination` по умолчанию `cs_cart`, но может быть переключён на `keycrm`.
  - при переключении на `keycrm` без заполнения настроек KeyCRM заявки будут сохраняться локально, но отправка в CRM упадёт с ошибкой (см. модуль `04-order-dispatch`).

