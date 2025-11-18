# Environment Variable Alignment Guide

## How Environment Variables Flow

```
gateway/.env.dev (NODE_ENV=development)
         ↓
    gateway.js loads .env.dev
         ↓
    app-manager.mjs receives process.env.NODE_ENV
         ↓
    Child Node.js apps inherit NODE_ENV=development
```

## Gateway Environment (`.env.dev`)

The gateway reads from `gateway/.env.dev`:
```env
GATEWAY_HTTP_PORT=8080
GATEWAY_HTTPS_PORT=4443
GATEWAY_ENABLE_HTTPS=true
NODE_ENV=development        # ← This is passed to child apps
LOG_LEVEL=info
```

## Child App Configuration Options

### Option 1: Inherit from Gateway (Simplest)
Just start your app from the gateway - it automatically inherits `NODE_ENV`:

```json
{
  "host": "myapp.local",
  "cwd": "c:/path/to/app",
  "start": "npm start",
  "port": 3000
}
```

The app receives `NODE_ENV=development` automatically!

### Option 2: App-Specific Environment Variables
Override or add specific env vars for an app:

```json
{
  "host": "myapp.local",
  "cwd": "c:/path/to/app",
  "start": "npm start",
  "port": 3000,
  "env": {
    "PORT": "3000",
    "DATABASE_URL": "mongodb://localhost:27017/mydb",
    "API_KEY": "dev-key-123"
  }
}
```

### Option 3: Load App's Own .env File
If your app has its own `.env.development` file:

```json
{
  "host": "myapp.local",
  "cwd": "c:/path/to/app",
  "start": "npm start",
  "port": 3000,
  "envFile": ".env.development"
}
```

**Priority order:**
1. App-specific `env` object in config (highest)
2. Variables from `envFile` if specified
3. Gateway's `process.env` (includes NODE_ENV from .env.dev)
4. System environment variables (lowest)

### Option 4: Absolute Path to Env File
```json
{
  "host": "myapp.local",
  "cwd": "c:/path/to/app",
  "start": "npm start",
  "port": 3000,
  "envFile": "c:/shared/.env.shared"
}
```

## Complete Example

### Gateway `.env.dev`:
```env
NODE_ENV=development
GATEWAY_HTTP_PORT=8080
GATEWAY_HTTPS_PORT=4443
```

### App's `.env.development`:
```env
PORT=3011
DATABASE_URL=mongodb://localhost:27017/dev_db
DEBUG=app:*
```

### Gateway Config:
```json
{
  "host": "myapp.local",
  "cwd": "c:/projects/myapp",
  "start": "npm start",
  "port": 3011,
  "envFile": ".env.development",
  "env": {
    "CUSTOM_VAR": "override-value"
  }
}
```

**Result:** The app receives:
- `NODE_ENV=development` (from gateway)
- `PORT=3011` (from `.env.development`)
- `DATABASE_URL=...` (from `.env.development`)
- `DEBUG=app:*` (from `.env.development`)
- `CUSTOM_VAR=override-value` (from config `env` object)

## Different Environments for Different Apps

You can run multiple apps with different environments:

```json
{
  "apps": [
    {
      "host": "app1.local",
      "cwd": "c:/apps/app1",
      "start": "npm start",
      "port": 3001,
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "host": "app2.local",
      "cwd": "c:/apps/app2",
      "start": "npm start",
      "port": 3002,
      "env": {
        "NODE_ENV": "staging"
      }
    },
    {
      "host": "app3.local",
      "cwd": "c:/apps/app3",
      "start": "npm start",
      "port": 3003,
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

## Production Deployment

### For Production (`.env.prod`):
```env
NODE_ENV=production
GATEWAY_HTTP_PORT=80
GATEWAY_HTTPS_PORT=443
```

Start with:
```powershell
# Copy .env.prod to .env.dev or rename
Copy-Item .env.prod .env.dev

# Or set NODE_ENV directly
$env:NODE_ENV="production"; node gateway.js

# Or use PM2 with production config
pm2 start ecosystem.config.js --env production
```

## Debugging Environment Issues

### Check what environment the gateway sees:
```powershell
node gateway.js
# Look for log: [config] Node Environment: development
```

### Check what child app receives:
Add this to your app's startup:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All ENV:', process.env);
```

View in gateway logs:
```powershell
pm2 logs gateway
# Or check admin UI logs panel
```

## Best Practices

1. **Gateway .env.dev**: Set `NODE_ENV=development` for dev environment
2. **App .env files**: Use for app-specific config (DB URLs, API keys)
3. **Config env object**: Use for overrides or secrets not in files
4. **Never commit**: Add `.env*` to `.gitignore` (except `.env.example`)
5. **Documentation**: Create `.env.example` showing required variables

## Summary

✅ **No more hardcoded NODE_ENV=production!**

The gateway now:
- Loads `NODE_ENV` from `.env.dev` 
- Passes it to all child apps automatically
- Allows per-app overrides via `env` config
- Supports loading app-specific `.env` files
- Respects priority: config > envFile > gateway > system
