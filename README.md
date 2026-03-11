# Landing Conveyor

Production-ready платформа для конвейера лендингов с админкой, аналитикой и интеграцией с CS-Cart Multi-Vendor.

## Особенности

- 🚀 Next.js 13 (App Router) + TypeScript
- 🎨 TailwindCSS + shadcn/ui
- 🗄️ MySQL/MariaDB + Prisma ORM
- 🔐 JWT авторизация
- 📊 Админ панель для управления лендингами
- 📱 Адаптивный дизайн
- 🔗 Интеграция с CS-Cart через webhook
- 📈 UTM tracking + Google Analytics
- 🛡️ Rate limiting и anti-spam

## Структура лендинга

Каждый лендинг может содержать несколько вариантов товара. Каждый вариант включает:

- Hero секцию с галереей изображений
- Цены с расчетом скидки
- Видео обзор
- Преимущества
- Характеристики
- Таблицы размеров
- Отзывы
- Повторяющиеся CTA блоки

## Локальный запуск через Docker Compose

### Требования

- Docker и Docker Compose
- Node.js 18+ (для разработки без Docker)

### Шаги

1. Клонируйте репозиторий и перейдите в директорию:

```bash
cd landing-conveyor
```

2. Создайте `.env` файл на основе `.env.example`:

```bash
cp .env.example .env
```

3. Отредактируйте `.env` при необходимости. Для локального запуска можно оставить значения по умолчанию.

4. Запустите Docker Compose:

```bash
docker-compose up -d
```

Это запустит:
- MySQL сервер на порту 3306
- phpMyAdmin на http://localhost:8080
- Next.js приложение на http://localhost:3000

5. Выполните миграции и seed:

```bash
# Войдите в контейнер приложения
docker-compose exec app sh

# Выполните миграции
npx prisma migrate deploy

# Заполните БД демо данными
npm run seed
```

6. Откройте приложение:

- **Публичный лендинг**: http://localhost:3000/l/demo-winter-suit
- **Админка**: http://localhost:3000/admin/login
- **phpMyAdmin**: http://localhost:8080

**Учетные данные админа** (по умолчанию):
- Email: admin@example.com
- Password: admin123

## Локальная разработка без Docker

1. Установите зависимости:

```bash
npm install
```

2. Настройте локальную MySQL:

```bash
# Убедитесь что MySQL запущен
# Создайте базу данных
mysql -u root -p
CREATE DATABASE landing_conveyor;
EXIT;
```

3. Обновите `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/landing_conveyor"
```

4. Выполните миграции и seed:

```bash
npx prisma migrate dev
npm run seed
```

5. Запустите dev сервер:

```bash
npm run dev
```

## Подключение к существующей MySQL на сервере

Если у вас уже есть MySQL сервер и phpMyAdmin:

1. Создайте базу данных через phpMyAdmin или CLI:

```sql
CREATE DATABASE landing_conveyor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Обновите `.env`:

```env
DATABASE_URL="mysql://username:password@host:3306/landing_conveyor"
```

3. Выполните миграции:

```bash
npx prisma migrate deploy
```

4. Заполните БД:

```bash
npm run seed
```

## Production деплой на сервере с Nginx

### 1. Подготовка сервера

Требования:
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- MySQL 8.0+ / MariaDB 10.6+
- Nginx
- PM2 (для управления процессом)

### 2. Установка зависимостей

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PM2 глобально
sudo npm install -g pm2

# Установите Nginx
sudo apt install -y nginx

# Установите MySQL (если еще не установлен)
sudo apt install -y mysql-server
```

### 3. Настройка MySQL

```bash
# Войдите в MySQL
sudo mysql

# Создайте базу данных и пользователя
CREATE DATABASE landing_conveyor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'landing_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON landing_conveyor.* TO 'landing_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Деплой приложения

```bash
# Перейдите в директорию проектов
cd /var/www

# Клонируйте или скопируйте проект
# (предполагается что код уже на сервере)
cd landing-conveyor

# Установите зависимости
npm ci --production

# Создайте .env файл
nano .env
```

Пример `.env` для production:

```env
DATABASE_URL="mysql://landing_user:your_strong_password@localhost:3306/landing_conveyor"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"
CSCART_WEBHOOK_URL="https://your-store.com/api/webhook/landing-leads"
LEAD_RETRY_SECRET="another-secure-secret"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV=production
```

```bash
# Выполните миграции
npx prisma migrate deploy

# Заполните БД (создаст админа)
npm run seed

# Соберите приложение
npm run build

# Создайте директорию для uploads
mkdir -p public/uploads
chmod 755 public/uploads
```

### 5. Настройка PM2

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'landing-conveyor',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/landing-conveyor',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Запустите приложение:

```bash
# Запустите PM2
pm2 start ecosystem.config.js

# Сохраните конфигурацию
pm2 save

# Настройте автозапуск
pm2 startup
# Выполните команду которую выведет pm2 startup
```

### 6. Настройка Nginx

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/landing-conveyor
```

Содержимое файла:

```nginx
upstream landing_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (будет настроено после получения SSL)
    # return 301 https://$server_name$request_uri;

    # Временно для получения SSL сертификата
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://landing_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location /_next/static {
        proxy_pass http://landing_app;
        proxy_cache_valid 60m;
    }

    location /uploads {
        alias /var/www/landing-conveyor/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Ограничения
    client_max_body_size 10M;
}
```

Активируйте конфигурацию:

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/landing-conveyor /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

### 7. Настройка SSL с Certbot

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot автоматически настроит HTTPS редирект
```

Обновите конфигурацию Nginx для HTTPS (Certbot сделает это автоматически):

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Остальная конфигурация как выше...
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 8. Обновление приложения

Для обновления приложения:

```bash
cd /var/www/landing-conveyor

# Остановите приложение
pm2 stop landing-conveyor

# Обновите код (git pull или загрузите новые файлы)
git pull origin main

# Установите зависимости
npm ci --production

# Выполните миграции (если есть)
npx prisma migrate deploy

# Пересоберите приложение
npm run build

# Запустите приложение
pm2 start landing-conveyor
```

## Структура проекта

```
landing-conveyor/
├── app/
│   ├── admin/           # Админ панель
│   ├── api/             # API routes
│   ├── l/[slug]/        # Публичные лендинги
│   └── layout.tsx
├── components/
│   ├── admin/           # Компоненты админки
│   ├── landing/         # Компоненты лендинга
│   └── ui/              # shadcn/ui компоненты
├── lib/
│   ├── auth.ts          # JWT авторизация
│   ├── db.ts            # Prisma client
│   └── utils.ts
├── prisma/
│   ├── schema.prisma    # Prisma схема
│   └── seed.ts          # Seed данные
├── public/
│   └── uploads/         # Загруженные файлы
├── docker-compose.yml   # Docker конфигурация
├── Dockerfile           # Docker образ
└── README.md
```

## API Endpoints

### Public API

- `POST /api/leads` - Создание заявки
- `GET /l/[slug]` - Публичный лендинг
- `GET /l/[slug]?preview=1` - Preview режим

### Admin API (требует авторизации)

- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущая сессия
- `GET /api/admin/landings` - Список лендингов
- `POST /api/admin/landings` - Создать лендинг
- `GET /api/admin/landings/[id]` - Получить лендинг
- `PUT /api/admin/landings/[id]` - Обновить лендинг
- `DELETE /api/admin/landings/[id]` - Удалить лендинг
- `POST /api/admin/variants` - Создать вариант
- `PUT /api/admin/variants/[id]` - Обновить вариант
- `DELETE /api/admin/variants/[id]` - Удалить вариант
- `GET /api/admin/leads` - Список заявок
- `POST /api/leads/retry` - Повторная отправка заявки
- `POST /api/upload` - Загрузка файлов

## Интеграция с CS-Cart

### Webhook формат

При создании заявки, система отправляет POST запрос на `CSCART_WEBHOOK_URL`:

```json
{
  "landing_slug": "demo-winter-suit",
  "landing_id": "uuid",
  "variant_id": "uuid",
  "variant_title": "Костюм 'Зимова Прогулянка' - М'ятний",
  "price": 1499,
  "old_price": 2999,
  "currency": "UAH",
  "name": "Олена К.",
  "phone": "+380671234567",
  "city": "Київ",
  "comment": "Доставка після 18:00",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "winter-sale",
    "content": "ad-1",
    "term": "winter-suit"
  },
  "click_ids": {
    "gclid": "Cj0KCQ...",
    "fbclid": "IwAR..."
  },
  "page_url": "https://yourdomain.com/l/demo-winter-suit",
  "created_at": "2024-02-14T12:00:00.000Z"
}
```

### Повторная отправка

Для повторной отправки failed заявок:

```bash
curl -X POST "https://yourdomain.com/api/leads/retry?secret=YOUR_SECRET&leadId=LEAD_UUID"
```

## Мониторинг и логи

### PM2 логи

```bash
# Просмотр логов
pm2 logs landing-conveyor

# Мониторинг
pm2 monit

# Статус
pm2 status
```

### Nginx логи

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

## Prisma Studio

Для визуального управления БД:

```bash
# Локально
npx prisma studio

# На сервере (через SSH туннель)
ssh -L 5555:localhost:5555 user@yourserver
npx prisma studio
```

Откройте http://localhost:5555 в браузере.

## Безопасность

1. Всегда используйте сильные пароли
2. Меняйте NEXTAUTH_SECRET и LEAD_RETRY_SECRET
3. Используйте HTTPS в production
4. Регулярно обновляйте зависимости
5. Настройте firewall (UFW)
6. Делайте резервные копии БД

## Резервное копирование

### MySQL

```bash
# Бэкап
mysqldump -u landing_user -p landing_conveyor > backup_$(date +%Y%m%d).sql

# Восстановление
mysql -u landing_user -p landing_conveyor < backup_20240214.sql
```

### Автоматический бэкап (cron)

```bash
# Добавьте в crontab
crontab -e

# Бэкап каждый день в 3:00
0 3 * * * mysqldump -u landing_user -pYOUR_PASSWORD landing_conveyor > /backups/landing_$(date +\%Y\%m\%d).sql
```

## Поддержка

Для вопросов и проблем создайте issue в репозитории или обратитесь к документации:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Лицензия

Proprietary - Все права защищены.
