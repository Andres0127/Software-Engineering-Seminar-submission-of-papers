# Script para actualizar eventos en la base de datos local
# Fechas actualizadas a partir del 30 de noviembre de 2025

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Actualizando eventos en la base de datos" -ForegroundColor Cyan
Write-Host "Fechas desde: 30 de noviembre 2025" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "python-backend\scripts\03-update-future-events-complete.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: No se encuentra el script SQL en: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Script encontrado: $scriptPath" -ForegroundColor Green
Write-Host ""

# Intentar ejecutar en Docker primero
Write-Host "Intentando ejecutar en contenedor Docker..." -ForegroundColor Yellow

$dockerResult = docker exec eventplatform-postgres psql -U postgres -d eventplatform -f /dev/stdin 2>&1 < $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Script ejecutado exitosamente en Docker" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verificando resultados..." -ForegroundColor Yellow
    
    # Verificar eventos insertados
    docker exec eventplatform-postgres psql -U postgres -d eventplatform -c "SELECT COUNT(*) as total_eventos FROM events;"
    docker exec eventplatform-postgres psql -U postgres -d eventplatform -c "SELECT name, date FROM events ORDER BY date LIMIT 5;"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Actualización completada!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
}

# Si Docker falló, intentar PostgreSQL local
Write-Host "Docker no disponible, intentando PostgreSQL local..." -ForegroundColor Yellow

$env:PGPASSWORD = "postgres"
$result = & psql -U postgres -d eventplatform -h localhost -p 5432 -f $scriptPath 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Script ejecutado exitosamente en PostgreSQL local" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verificando resultados..." -ForegroundColor Yellow
    
    & psql -U postgres -d eventplatform -h localhost -p 5432 -c "SELECT COUNT(*) as total_eventos FROM events;"
    & psql -U postgres -d eventplatform -h localhost -p 5432 -c "SELECT name, date FROM events ORDER BY date LIMIT 5;"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Actualización completada!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "ERROR: No se pudo ejecutar el script" -ForegroundColor Red
Write-Host ""
Write-Host "Por favor, verifica:" -ForegroundColor Yellow
Write-Host "  1. Que Docker esté corriendo y el contenedor 'eventplatform-postgres' esté activo, O" -ForegroundColor Yellow
Write-Host "  2. Que PostgreSQL esté instalado localmente y corriendo en el puerto 5432" -ForegroundColor Yellow
Write-Host ""
Write-Host "Puedes ejecutar el script manualmente con:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -d eventplatform -f python-backend\scripts\03-update-future-events-complete.sql" -ForegroundColor White
Write-Host ""



