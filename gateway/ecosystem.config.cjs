/**
 * PM2 ecosystem file for running the gateway more easily under pm2.
 *
 * Usage:
 *   # from the gateway folder
 *   pm2 start ecosystem.config.js
 *   pm2 stop gateway
 *   pm2 restart gateway
 *   pm2 logs gateway
 *
 * Environment variables supported:
 *   - NODE_ENV: Node environment (default: production)
 *   - GATEWAY_ADMIN_TOKEN: admin token to secure the admin API/UI
 *   - GATEWAY_ADMIN_WS: set to '0' to keep the admin WebSocket disabled at startup
 *
 * Notes:
 *   This configuration runs only the gateway process under pm2. You can then use
 *   the gateway UI's App Manager to start/stop apps (pm2 isn't required to manage
 *   individual apps — the gateway will spawn and manage them directly).
 */

module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'gateway.js',
      cwd: __dirname,
      interpreter: 'node',
      // Load .env.dev file automatically
      env_file: '.env.dev',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        GATEWAY_HTTP_PORT: process.env.GATEWAY_HTTP_PORT || '8080',
        GATEWAY_HTTPS_PORT: process.env.GATEWAY_HTTPS_PORT || '4443',
        GATEWAY_ENABLE_HTTPS: process.env.GATEWAY_ENABLE_HTTPS || 'true',
        GATEWAY_ADMIN_TOKEN: process.env.GATEWAY_ADMIN_TOKEN || 'changeme-dev-token',
        GATEWAY_ADMIN_WS: process.env.GATEWAY_ADMIN_WS || '1',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info'
      },
      // keep the process running across reboots
      autorestart: true,
      watch: false,
      instances: 1,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      out_file: './logs/gateway-out.log',
      error_file: './logs/gateway-err.log'
    }
  ]
};
