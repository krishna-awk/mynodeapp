/**
 * PM2 ecosystem file for running the gateway more easily under pm2.
 *
 * Usage:
 *   # from the gateway folder
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop gateway
 *   pm2 restart gateway
 *   pm2 logs gateway
 *
 * Environment variables supported:
 *   - NODE_ENV: Node environment (default: development)
 *   - GATEWAY_ADMIN_TOKEN: admin token to secure the admin API/UI
 *   - GATEWAY_ADMIN_WS: set to '1' to enable admin WebSocket
 *
 * Notes:
 *   This configuration runs only the gateway process under pm2. You can then use
 *   the gateway UI's App Manager to start/stop apps (pm2 isn't required to manage
 *   individual apps — the gateway will spawn and manage them directly).
 */

const path = require('path');
const fs = require('fs');

// Manually load .env.dev file since env_file has issues with ESM on Windows
function loadEnvFile(filePath) {
  const envVars = {};
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.trim().match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      });
      console.log(`[PM2 Config] Loaded ${Object.keys(envVars).length} variables from ${filePath}`);
    }
  } catch (e) {
    console.error(`[PM2 Config] Failed to load ${filePath}:`, e.message);
  }
  return envVars;
}

// Load .env.dev from gateway directory
const envFromFile = loadEnvFile(path.join(__dirname, '.env.dev'));

module.exports = {
  apps: [
    {
      name: 'gateway',
      script: './gateway.js',
      cwd: path.resolve(__dirname),
      interpreter: 'node',
      exec_mode: 'fork', // Use fork mode instead of cluster for ESM compatibility
      // Merge env from file with explicit overrides
      env: {
        // Load from .env.dev first
        ...envFromFile,
        // Allow overrides from process.env or explicit defaults
        NODE_ENV: process.env.NODE_ENV || envFromFile.NODE_ENV || 'development',
        GATEWAY_HTTP_PORT: process.env.GATEWAY_HTTP_PORT || envFromFile.GATEWAY_HTTP_PORT || '8080',
        GATEWAY_HTTPS_PORT: process.env.GATEWAY_HTTPS_PORT || envFromFile.GATEWAY_HTTPS_PORT || '4443',
        GATEWAY_ENABLE_HTTPS: process.env.GATEWAY_ENABLE_HTTPS || envFromFile.GATEWAY_ENABLE_HTTPS || 'true',
        GATEWAY_ADMIN_TOKEN: process.env.GATEWAY_ADMIN_TOKEN || envFromFile.GATEWAY_ADMIN_TOKEN || 'changeme-dev-token',
        GATEWAY_ADMIN_WS: process.env.GATEWAY_ADMIN_WS || envFromFile.GATEWAY_ADMIN_WS || '1',
        LOG_LEVEL: process.env.LOG_LEVEL || envFromFile.LOG_LEVEL || 'info'
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
