# Script para restaurar el backup de eventos
# Solicita la contraseña de forma segura

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restaurando Backup de Eventos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
if (-not (Test-Path "Backup\Backup_Events.sql")) {
    Write-Host "ERROR: No se encuentra Backup\Backup_Events.sql" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Configuración
$PGUSER = "postgres"
$PGHOST = "localhost"
$PGPORT = "5432"
$PGDATABASE = "eventplatform"
$backupFile = "Backup\Backup_Events.sql"

Write-Host "Configuracion:" -ForegroundColor Yellow
Write-Host "  Usuario: $PGUSER"
Write-Host "  Host: $PGHOST"
Write-Host "  Puerto: $PGPORT"
Write-Host "  Base de datos: $PGDATABASE"
Write-Host "  Archivo: $backupFile"
Write-Host ""

# Solicitar contraseña de forma segura
$securePassword = Read-Host "Ingresa la contraseña de PostgreSQL para el usuario '$PGUSER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Establecer variable de entorno
$env:PGPASSWORD = $PGPASSWORD

Write-Host ""
Write-Host "Ejecutando pg_restore..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar pg_restore
$result = & pg_restore -U $PGUSER -h $PGHOST -p $PGPORT -d $PGDATABASE --clean --if-exists -v $backupFile 2>&1

# Limpiar la contraseña de memoria
$env:PGPASSWORD = $null
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[OK] Backup restaurado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La base de datos '$PGDATABASE' ha sido actualizada con el backup." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "[ERROR] No se pudo restaurar el backup" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Salida del comando:" -ForegroundColor Yellow
    Write-Host $result
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "- Contraseña incorrecta"
    Write-Host "- PostgreSQL no esta corriendo"
    Write-Host "- La base de datos '$PGDATABASE' no existe"
    Write-Host "- Problemas de permisos"
}

Write-Host ""
Read-Host "Presiona Enter para salir"

