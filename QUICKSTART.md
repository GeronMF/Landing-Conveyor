# Быстрый старт

## Локальный запуск через Docker (рекомендуется)

1. Убедитесь что Docker и Docker Compose установлены

2. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

3. Запустите все сервисы:
```bash
docker-compose up -d
```

4. Дождитесь запуска MySQL (15-30 секунд), затем выполните миграции:
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed
```

5. Откройте приложение:
- **Главная**: http://localhost:3000
- **Демо лендинг**: http://localhost:3000/l/demo-winter-suit
- **Админка**: http://localhost:3000/admin/login
- **phpMyAdmin**: http://localhost:8080

**Данные для входа:**
- Email: admin@example.com
- Password: admin123

## Локальный запуск без Docker

1. Установите Node.js 18+ и MySQL 8.0+

2. Создайте базу данных:
```bash
mysql -u root -p
CREATE DATABASE landing_conveyor;
EXIT;
```

3. Скопируйте `.env.example` в `.env` и настройте:
```env
DATABASE_URL="mysql://root:password@localhost:3306/landing_conveyor"
```

4. Установите зависимости и выполните миграции:
```bash
npm install
npx prisma migrate deploy
npm run seed
```

5. Запустите dev сервер:
```bash
npm run dev
```

6. Откройте http://localhost:3000

## Production деплой

Смотрите подробную инструкцию в файле **README.md**, раздел "Production деплой на сервере с Nginx".

Основные шаги:
1. Настройка сервера (Node.js, MySQL, Nginx)
2. Создание базы данных
3. Настройка `.env` файла
4. Запуск миграций и seed
5. Build приложения
6. Настройка PM2/systemd
7. Настройка Nginx
8. Получение SSL сертификата

## Структура БД

Проект использует следующие основные таблицы:
- **User** - Администраторы
- **Landing** - Лендинги
- **Variant** - Варианты товаров
- **VariantImage, Benefit, Specification, SizeTable, Review** - Связанные данные
- **FAQ** - Часто задаваемые вопросы
- **Lead** - Заявки от клиентов

## Управление данными

**Через phpMyAdmin:**
- http://localhost:8080 (логин: root, пароль: password)

**Через Prisma Studio:**
```bash
npx prisma studio
```

## Полезные команды

```bash
# Просмотр логов Docker
docker-compose logs -f

# Перезапуск приложения
docker-compose restart app

# Остановка всех сервисов
docker-compose down

# Создание новой миграции
npx prisma migrate dev --name migration_name

# Пересборка проекта
npm run build

# Проверка типов
npm run typecheck
```

## Интеграция с CS-Cart

Настройте в `.env`:
```env
CSCART_WEBHOOK_URL="https://your-store.com/api/webhook/landing-leads"
CSCART_API_TOKEN="your-api-token"
LEAD_DELIVERY_MODE="webhook"
LEAD_RETRY_SECRET="your-secret"
```

При создании заявки система автоматически отправит данные на указанный webhook.

## Поддержка

Полная документация доступна в **README.md**
