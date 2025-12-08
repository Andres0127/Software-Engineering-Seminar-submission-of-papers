@echo off
chcp 65001 >nul
echo ========================================
echo ACTUALIZAR EVENTOS EN BASE DE DATOS LOCAL
echo Fechas desde: 30 de noviembre 2025
echo ========================================
echo.

set SCRIPT_PATH=python-backend\scripts\03-update-future-events-complete.sql

if not exist "%SCRIPT_PATH%" (
    echo ERROR: No se encuentra el script SQL
    pause
    exit /b 1
)

echo Script encontrado: %SCRIPT_PATH%
echo.

REM Intentar Docker primero
echo Intentando ejecutar en contenedor Docker...
docker exec -i eventplatform-postgres psql -U postgres -d eventplatform < %SCRIPT_PATH% 2>&1
if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Verificando resultados...
    echo ========================================
    docker exec eventplatform-postgres psql -U postgres -d eventplatform -c "SELECT COUNT(*) as total_eventos FROM events;"
    docker exec eventplatform-postgres psql -U postgres -d eventplatform -c "SELECT name, date FROM events ORDER BY date LIMIT 5;"
    echo.
    echo ========================================
    echo Actualización completada exitosamente!
    echo ========================================
    pause
    exit /b 0
)

REM Si Docker falló, intentar PostgreSQL local en puerto 5432
echo.
echo Docker no disponible, intentando PostgreSQL local...
set PGPASSWORD=postgres
psql -U postgres -d eventplatform -h localhost -p 5432 -f %SCRIPT_PATH% 2>&1
if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Verificando resultados...
    echo ========================================
    psql -U postgres -d eventplatform -h localhost -p 5432 -c "SELECT COUNT(*) as total_eventos FROM events;"
    psql -U postgres -d eventplatform -h localhost -p 5432 -c "SELECT name, date FROM events ORDER BY date LIMIT 5;"
    echo.
    echo ========================================
    echo Actualización completada exitosamente!
    echo ========================================
    pause
    exit /b 0
)

REM Intentar puerto 5433 (Docker mapeado)
echo.
echo Intentando PostgreSQL en puerto 5433 (Docker)...
psql -U postgres -d eventplatform -h localhost -p 5433 -f %SCRIPT_PATH% 2>&1
if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Verificando resultados...
    echo ========================================
    psql -U postgres -d eventplatform -h localhost -p 5433 -c "SELECT COUNT(*) as total_eventos FROM events;"
    psql -U postgres -d eventplatform -h localhost -p 5433 -c "SELECT name, date FROM events ORDER BY date LIMIT 5;"
    echo.
    echo ========================================
    echo Actualización completada exitosamente!
    echo ========================================
    pause
    exit /b 0
)

echo.
echo ========================================
echo ERROR: No se pudo ejecutar el script
echo ========================================
echo.
echo Por favor, verifica:
echo   1. Que Docker esté corriendo y el contenedor 'eventplatform-postgres' esté activo, O
echo   2. Que PostgreSQL esté instalado localmente y corriendo
echo.
echo Puedes ejecutar el script manualmente con:
echo   psql -U postgres -d eventplatform -f %SCRIPT_PATH%
echo.
pause



