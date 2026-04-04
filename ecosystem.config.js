/**
 * PM2 для topcina.store (пользователь topcinastore на сервере).
 * Next.js output: standalone → запуск server.js из каталога standalone (иначе /_next/static даёт 404).
 */
module.exports = {
  apps: [{
    name: 'landing-conveyor',
    script: 'server.js',
    cwd: '/home/topcinastore/app/.next/standalone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
      MEDIA_STORAGE_ROOT: '/home/topcinastore/www',
    },
    error_file: '/home/topcinastore/app/logs/err.log',
    out_file: '/home/topcinastore/app/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
