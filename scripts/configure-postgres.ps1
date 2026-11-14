# First-time setup; does not overwrite an existing server/.env.
$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$target = Join-Path $project "server\.env"
if (Test-Path $target) {
  Write-Host "server/.env already exists. Edit DATABASE_URL there; this script will not overwrite it." -ForegroundColor Yellow
  exit 0
}

Write-Host "Paste your PostgreSQL cloud connection URL (input hidden)." -ForegroundColor Cyan
$secure = Read-Host "PostgreSQL URL" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { $url = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
if ($url -notmatch '^postgres(ql)?://') { throw "Invalid PostgreSQL URL. No file written." }
$bytes = [byte[]]::new(48)
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [Convert]::ToBase64String($bytes)
$contents = @"
NODE_ENV=development
PORT=5000
DATABASE_URL=$url
CLIENT_ORIGIN=http://localhost:5173
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=$secret
"@
Set-Content -Path $target -Value $contents -Encoding UTF8
Write-Host "server/.env created. Never commit credentials." -ForegroundColor Green
Write-Host "Next: npm install; npm run db:ping; npm run db:migrate; npm run auth:migrate" -ForegroundColor Cyan
