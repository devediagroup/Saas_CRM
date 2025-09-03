module.exports = {
  apps: [{
    name: 'echoops-crm-backend',
    script: 'dist/main.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Logging
    log_file: './logs/app.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Process management
    max_memory_restart: '1G',
    restart_delay: 4000,
    // Health monitoring
    health_check: {
      enabled: true,
      url: 'http://localhost:3000/health',
      interval: 30000, // 30 seconds
      timeout: 5000,
      retries: 3,
    },
    // Auto restart
    autorestart: true,
    watch: false, // Disable watch in production
    // Graceful shutdown
    kill_timeout: 5000,
    // Resource limits
    max_restarts: 10,
    min_uptime: '10s',
    // Environment variables
    env_file: '.env',
  }],
};
