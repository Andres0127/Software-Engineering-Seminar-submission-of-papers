# Script PowerShell para ejecutar el backup de eventos en PostgreSQL
# Este script restaura/actualiza la base de datos con el backup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Event Platform - Restaurar Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "Backup\Backup_Events.sql")) {
    Write-Host "ERROR: No se encuentra Backup_Events.sql" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde Workshop-3/python-backend" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar que PostgreSQL está disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql no encontrado en PATH" -ForegroundColor Red
    Write-Host "Asegurate de que PostgreSQL este instalado y en el PATH" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Verificando conexion a PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

# Configuración (valores por defecto)
$env:PGUSER = "postgres"
$env:PGPASSWORD = "200127"
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$PGDATABASE = "eventplatform"

Write-Host "Configuracion:" -ForegroundColor Cyan
Write-Host "  Usuario: $env:PGUSER"
Write-Host "  Host: $env:PGHOST"
Write-Host "  Puerto: $env:PGPORT"
Write-Host "  Base de datos: $PGDATABASE"
Write-Host ""

# Preguntar si quiere cambiar la contraseña
$cambiarPass = Read-Host "¿Tu password de PostgreSQL es diferente de '200127'? (s/n)"
if ($cambiarPass -eq "s" -or $cambiarPass -eq "S") {
    $securePassword = Read-Host "Ingresa tu password de PostgreSQL" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ejecutando Backup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el backup
Write-Host "Ejecutando Backup_Events.sql..." -ForegroundColor Yellow
$backupPath = Join-Path $PSScriptRoot "Backup\Backup_Events.sql"

Write-Host ""
Write-Host "NOTA: Este es un dump binario de pg_dump" -ForegroundColor Cyan
Write-Host "Usando pg_restore para restaurarlo..." -ForegroundColor Cyan
Write-Host ""

# El archivo es un dump binario, usar pg_restore
$env:PGPASSWORD = $env:PGPASSWORD
$result = & pg_restore -U $env:PGUSER -h $env:PGHOST -p $env:PGPORT -d $PGDATABASE --clean --if-exists -v $backupPath 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[OK] Backup ejecutado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La base de datos ha sido actualizada con el backup." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "[ERROR] Hubo un problema al ejecutar el backup" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "- La base de datos no existe"
    Write-Host "- Credenciales incorrectas"
    Write-Host "- PostgreSQL no esta corriendo"
    Write-Host "- El archivo de backup tiene errores"
    Write-Host ""
    Write-Host "Salida del comando:" -ForegroundColor Yellow
    Write-Host $result
}

Write-Host ""
Read-Host "Presiona Enter para salir"

