# Run once ONLY when applying the Update-Only archive over an old MongoDB project.
# The full PostgreSQL ZIP is already clean and does not need this script.
$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$oldFiles = @(
  "scripts\configure-atlas.ps1",
  "server\src\config\auth-db.ts",
  "server\src\models\course.model.ts",
  "server\src\models\lecture.model.ts",
  "server\src\services\course.service.ts"
)
foreach ($path in $oldFiles) {
  $target = Join-Path $project $path
  if (Test-Path -LiteralPath $target -PathType Leaf) {
    Remove-Item -LiteralPath $target -Force
    Write-Host "Removed legacy MongoDB file: $path"
  }
}
Write-Host "Legacy MongoDB source cleanup completed. Now edit server/.env and set DATABASE_URL." -ForegroundColor Green
