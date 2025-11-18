# Gateway Start Commands

## Prerequisites

Install dependencies first:
```powershell
cd gateway
npm install
```

This will install `dotenv` and other required packages.

## Environment Configuration

The gateway reads configuration from `.env.dev` file:
- `GATEWAY_HTTP_PORT=8080` - HTTP port (for ACME, redirects, and admin API)
- `GATEWAY_HTTPS_PORT=4443` - HTTPS port (for secure traffic)
- `GATEWAY_ENABLE_HTTPS=true` - Enable HTTPS
- `NODE_ENV=production` - Node environment
- `LOG_LEVEL=info` - Logging level

## Start Commands

### Option 1: Direct Node (Recommended for Development)
```powershell
# From gateway directory
cd gateway
node gateway.js
```
The gateway will automatically load `.env.dev` file.

### Option 2: Using PowerShell Script
```powershell
# From gateway directory
cd gateway
.\start-gateway.ps1
```

### Option 3: Using npm script
```powershell
# From gateway directory
cd gateway
npm start
```

### Option 4: Using PM2 (Production)
```powershell
# Install PM2 globally (one-time)
npm install -g pm2

# From gateway directory
cd gateway

# Start with ecosystem config (loads .env.dev automatically)
pm2 start ecosystem.config.js

# View logs
pm2 logs gateway

# Stop gateway
pm2 stop gateway

# Restart gateway
pm2 restart gateway

# Delete from PM2
pm2 delete gateway

# Save PM2 process list (survives reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Access Points

After starting the gateway:

- **HTTP (redirects to HTTPS)**: http://localhost:8080
- **HTTPS**: https://localhost:4443
- **Admin API**: http://localhost:8080/admin/* or https://localhost:4443/admin/*

## Testing with Custom Domain

1. Add to Windows hosts file (requires admin):
   ```
   127.0.0.1    local.myapp
   ```
   Edit: `C:\Windows\System32\drivers\etc\hosts`

2. Access via:
   - http://local.myapp:8080 (redirects to https)
   - https://local.myapp:4443 (direct HTTPS)

## Troubleshooting

### Port already in use
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Certificate warnings
The gateway generates self-signed certificates for local domains. To avoid browser warnings:
1. Export the certificate: `gateway/storage/local-gateway.crt`
2. Import it into Windows Trusted Root Certification Authorities

### Check if gateway is running
```powershell
# Test HTTP port
curl http://localhost:8080

# Test HTTPS port (ignore cert warning)
curl -k https://localhost:4443
```

## Environment Variables Priority

The gateway loads configuration in this order (highest to lowest priority):
1. Environment variables set in terminal/PM2
2. `.env.dev` file in gateway directory
3. `.env` file in gateway directory  
4. Values in `gateway.config.json`
5. Hardcoded defaults (8080, 4443)

## Quick Commands Reference

```powershell
# Install dependencies
npm install

# Start directly
node gateway.js

# Start with PM2
pm2 start ecosystem.config.js

# View PM2 logs
pm2 logs gateway

# Restart PM2 process
pm2 restart gateway

# Stop PM2 process
pm2 stop gateway
```
