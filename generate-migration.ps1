# generate-migration.ps1
# Script to generate new migrations in file-service

param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$MigrationName
)

# If no name provided -> generate one
if (-not $MigrationName -or $MigrationName -eq "") {
    $MigrationName = "Migration_$(Get-Date -Format 'yyyyMMddHHmmss')"
}

Write-Host "Generating migration: $MigrationName" -ForegroundColor Cyan

# Ensure we are in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from file-service root." -ForegroundColor Red
    exit 1
}

# FULL PATH FOR TYPEORM CLI: src/migrations/<Name>
$migrationPath = "src/migrations/$MigrationName"

try {
    Write-Host "Running: npm run typeorm -- migration:generate $migrationPath -d src/data-source.ts" -ForegroundColor Yellow
    npm run typeorm -- migration:generate $migrationPath -d src/data-source.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration '$MigrationName' generated successfully." -ForegroundColor Green
        Write-Host "Check the file in src/migrations/ folder." -ForegroundColor Gray
    } else {
        Write-Host "Error while generating migration" -ForegroundColor Red
    }
} catch {
    Write-Host "Unexpected error: $_" -ForegroundColor Red
}

Write-Host "`nExisting migrations:" -ForegroundColor Blue
Get-ChildItem -Path "src/migrations" -Filter "*.ts" | Sort-Object Name | ForEach-Object {
    Write-Host "   $($_.Name)" -ForegroundColor Gray
}

Write-Host "`nTo run migrations use: .\run-migration.ps1" -ForegroundColor Cyan

