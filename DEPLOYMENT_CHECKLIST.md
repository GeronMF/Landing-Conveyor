# Deployment Checklist

Используйте этот чеклист для уверенного деплоя Landing Conveyor в production.

## Pre-Deployment

### Сервер
- [ ] Ubuntu 20.04+ или Debian 11+ установлен
- [ ] Root или sudo доступ настроен
- [ ] SSH ключи настроены
- [ ] Firewall (UFW) установлен и настроен
- [ ] Обновления системы установлены (`apt update && apt upgrade`)

### Домен
- [ ] Домен зарегистрирован
- [ ] DNS A запись указывает на IP сервера
- [ ] DNS распространился (проверка: `dig yourdomain.com`)

### Зависимости
- [ ] Node.js 18+ установлен
- [ ] npm установлен
- [ ] MySQL 8.0+ или MariaDB 10.6+ установлен
- [ ] Nginx установлен
- [ ] Certbot установлен
- [ ] PM2 установлен глобально (`npm i -g pm2`)

## Database Setup

- [ ] MySQL служба запущена (`systemctl status mysql`)
- [ ] Создана база данных `landing_conveyor`
- [ ] Создан MySQL пользователь с правами
- [ ] Проверено подключение к БД
- [ ] phpMyAdmin установлен (опционально)

## Application Setup

### Файлы
- [ ] Код загружен в `/var/www/landing-conveyor`
- [ ] Владелец файлов настроен (`chown -R www-data:www-data`)
- [ ] Права доступа настроены (755 для директорий, 644 для файлов)
- [ ] `.env` файл создан и настроен
- [ ] `public/uploads` директория создана

### Environment Variables (.env)
- [ ] `DATABASE_URL` настроен с реальными данными
- [ ] `NEXTAUTH_SECRET` сгенерирован (32+ символов)
- [ ] `NEXTAUTH_URL` указывает на production домен (https://)
- [ ] `ADMIN_EMAIL` настроен
- [ ] `ADMIN_PASSWORD` сильный пароль установлен
- [ ] `CSCART_WEBHOOK_URL` настроен
- [ ] `CSCART_API_TOKEN` настроен (если нужен)
- [ ] `LEAD_RETRY_SECRET` сгенерирован
- [ ] `NEXT_PUBLIC_GTM_ID` настроен (если используется)
- [ ] `NEXT_PUBLIC_APP_URL` указывает на production домен
- [ ] `NODE_ENV=production` установлен

### Dependencies & Build
- [ ] `npm ci --production` выполнен
- [ ] `npx prisma generate` выполнен
- [ ] `npx prisma migrate deploy` выполнен успешно
- [ ] `npm run seed` выполнен (создан админ)
- [ ] `npm run build` выполнен успешно
- [ ] `.next/standalone` директория создана

## Process Manager (PM2)

- [ ] `ecosystem.config.js` настроен (проверить пути)
- [ ] `pm2 start ecosystem.config.js` выполнен
- [ ] `pm2 status` показывает статус "online"
- [ ] `pm2 logs` не показывает ошибок
- [ ] `pm2 save` выполнен
- [ ] `pm2 startup` настроен (автозапуск)

**Или Systemd:**
- [ ] Service файл скопирован в `/etc/systemd/system/`
- [ ] `systemctl daemon-reload` выполнен
- [ ] `systemctl enable landing-conveyor` выполнен
- [ ] `systemctl start landing-conveyor` выполнен
- [ ] `systemctl status landing-conveyor` показывает "active"

## Nginx Configuration

### Basic Setup
- [ ] Конфигурация создана в `/etc/nginx/sites-available/landing-conveyor`
- [ ] Symlink создан в `/etc/nginx/sites-enabled/`
- [ ] `server_name` настроен с реальным доменом
- [ ] Upstream `landing_app` указывает на `127.0.0.1:3000`
- [ ] `nginx -t` проходит без ошибок
- [ ] `systemctl restart nginx` выполнен успешно

### Static Files
- [ ] `/uploads` location настроен
- [ ] `/_next/static` location настроен
- [ ] Caching headers добавлены

### Security
- [ ] `client_max_body_size 10M` установлен
- [ ] Security headers добавлены (X-Frame-Options, etc.)
- [ ] Gzip compression включен

## SSL Certificate

- [ ] Port 80 открыт в firewall
- [ ] Certbot установлен
- [ ] `certbot --nginx -d yourdomain.com -d www.yourdomain.com` выполнен
- [ ] SSL сертификат получен успешно
- [ ] HTTPS редирект работает
- [ ] Auto-renewal настроен (`certbot renew --dry-run`)

## Firewall (UFW)

- [ ] UFW установлен
- [ ] SSH (22) разрешен: `ufw allow 22/tcp`
- [ ] HTTP (80) разрешен: `ufw allow 80/tcp`
- [ ] HTTPS (443) разрешен: `ufw allow 443/tcp`
- [ ] MySQL закрыт извне (только localhost)
- [ ] UFW включен: `ufw enable`
- [ ] `ufw status` проверен

## Testing

### Basic Functionality
- [ ] Главная страница загружается (https://yourdomain.com)
- [ ] Демо лендинг загружается (https://yourdomain.com/l/demo-winter-suit)
- [ ] Админка загружается (https://yourdomain.com/admin/login)
- [ ] Логин в админку работает
- [ ] Список лендингов отображается
- [ ] Preview лендинга работает

### Forms & API
- [ ] Форма заявки открывается
- [ ] Отправка заявки работает
- [ ] Заявка сохраняется в БД
- [ ] Webhook в CS-Cart отправляется (если настроен)
- [ ] Статус заявки обновляется корректно

### File Upload
- [ ] Загрузка изображений работает
- [ ] Файлы сохраняются в `public/uploads`
- [ ] Загруженные файлы доступны по URL

### Performance
- [ ] Время загрузки < 3 секунд
- [ ] Static файлы кешируются
- [ ] Gzip работает (проверка в DevTools)
- [ ] Images отдаются корректно

## Monitoring & Maintenance

### Logs
- [ ] PM2 logs доступны: `pm2 logs`
- [ ] Nginx logs настроены
- [ ] Systemd logs доступны (если используется): `journalctl -u landing-conveyor`

### Backup
- [ ] Backup скрипт для MySQL создан
- [ ] Cron job для автобэкапа настроен (опционально)
- [ ] Backup директория создана (`/backups`)
- [ ] Тестовый backup выполнен и восстановлен

### Monitoring
- [ ] Disk space мониторинг настроен
- [ ] CPU/RAM мониторинг настроен (опционально)
- [ ] Uptime мониторинг настроен (опционально)

## Security Checklist

- [ ] Strong passwords везде
- [ ] SSH password authentication отключен (только keys)
- [ ] Root login через SSH отключен
- [ ] `.env` файл не доступен через web
- [ ] Unnecessary ports закрыты
- [ ] MySQL доступен только с localhost
- [ ] Fail2ban установлен (опционально, но рекомендуется)

## Documentation

- [ ] Production URL задокументирован
- [ ] Учетные данные сохранены в безопасном месте
- [ ] API keys сохранены
- [ ] Backup процедура задокументирована
- [ ] Deployment процесс задокументирован для команды

## Post-Deployment

### Immediate Actions
- [ ] Изменить дефолтный пароль админа
- [ ] Создать резервную копию БД
- [ ] Проверить все критические функции
- [ ] Настроить мониторинг (если используется)

### Within 24 Hours
- [ ] Проверить логи на ошибки
- [ ] Проверить metrics (если настроены)
- [ ] Убедиться что SSL auto-renewal работает
- [ ] Проверить backup automation

### Within 1 Week
- [ ] Проверить что все заявки обрабатываются
- [ ] Проверить webhook логи в CS-Cart
- [ ] Оптимизировать производительность (если нужно)
- [ ] Добавить дополнительные лендинги

## Emergency Contacts

- Hosting provider support: __________________
- Domain registrar support: __________________
- Database admin: __________________
- Development team: __________________

## Rollback Plan

В случае критической ошибки:

1. Остановить приложение:
   ```bash
   pm2 stop landing-conveyor
   # или
   systemctl stop landing-conveyor
   ```

2. Восстановить предыдущую версию:
   ```bash
   cd /var/www/landing-conveyor
   git checkout previous-working-tag
   npm ci --production
   npm run build
   ```

3. Восстановить БД из backup (если нужно):
   ```bash
   mysql -u landing_user -p landing_conveyor < /backups/backup_YYYYMMDD.sql
   ```

4. Запустить приложение:
   ```bash
   pm2 start landing-conveyor
   # или
   systemctl start landing-conveyor
   ```

---

**После завершения всех пунктов, ваше приложение готово к production использованию!**

Сохраните этот чеклист для будущих deployments и обновлений.
