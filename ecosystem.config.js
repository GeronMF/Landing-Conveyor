module.exports = {
  apps: [{
    name: 'landing-conveyor',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/cinopadstore/app/project',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 9009
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
