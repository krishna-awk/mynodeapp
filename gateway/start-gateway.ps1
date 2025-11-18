# Start Gateway with Environment Variables
# Loads configuration from .env.dev file

Write-Host "Starting Gateway Server..." -ForegroundColor Green

# Check if .env.dev exists
$envFile = Join-Path $PSScriptRoot ".env.dev"
if (Test-Path $envFile) {
    Write-Host "Environment file found: $envFile" -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            Write-Host "  $($matches[1]) = $($matches[2])" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "Warning: .env.dev not found, using defaults" -ForegroundColor Yellow
}

# Navigate to gateway directory
Set-Location $PSScriptRoot

# Start the gateway
Write-Host "`nStarting node gateway.js..." -ForegroundColor Green
node gateway.js
