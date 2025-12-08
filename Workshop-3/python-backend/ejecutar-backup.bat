@echo off
REM Script para ejecutar el backup de eventos en PostgreSQL
REM Este script restaura/actualiza la base de datos con el backup

echo ========================================
echo Event Platform - Restaurar Backup
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "Backup\Backup_Events.sql" (
    echo ERROR: No se encuentra Backup_Events.sql
    echo Asegurate de ejecutar este script desde Workshop-3/python-backend
    pause
    exit /b 1
)

REM Verificar que PostgreSQL está disponible
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql no encontrado en PATH
    echo Asegurate de que PostgreSQL este instalado y en el PATH
    pause
    exit /b 1
)

echo Verificando conexion a PostgreSQL...
echo.

REM Leer configuración (valores por defecto)
set PGUSER=postgres
set PGPASSWORD=200127
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=eventplatform

echo Configuracion:
echo   Usuario: %PGUSER%
echo   Host: %PGHOST%
echo   Puerto: %PGPORT%
echo   Base de datos: %PGDATABASE%
echo.

REM Preguntar si quiere cambiar la contraseña
set /p cambiar_pass="¿Tu password de PostgreSQL es diferente de '200127'? (s/n): "
if /i "%cambiar_pass%"=="s" (
    set /p PGPASSWORD="Ingresa tu password de PostgreSQL: "
)

echo.
echo ========================================
echo Ejecutando Backup...
echo ========================================
echo.

REM Establecer variable de entorno para password (evita prompt interactivo)
set PGPASSWORD=%PGPASSWORD%

REM Ejecutar el backup
echo Ejecutando Backup_Events.sql...
echo.

REM Establecer variable de entorno para evitar prompt de password
set PGPASSWORD=%PGPASSWORD%

REM Verificar si es un dump de pg_dump (formato custom/binario) o SQL plano
REM Intentar primero como SQL plano, si falla, usar pg_restore
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f Backup\Backup_Events.sql 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo El archivo parece ser un dump binario, intentando con pg_restore...
    pg_restore -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% --clean --if-exists Backup\Backup_Events.sql
    if %ERRORLEVEL% EQU 0 (
        echo Restauracion completada con pg_restore
    ) else (
        echo ERROR: No se pudo restaurar el backup
        echo Verifica que el archivo sea un dump valido de PostgreSQL
        exit /b 1
    )
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [OK] Backup ejecutado exitosamente!
    echo ========================================
    echo.
    echo La base de datos ha sido actualizada con el backup.
) else (
    echo.
    echo ========================================
    echo [ERROR] Hubo un problema al ejecutar el backup
    echo ========================================
    echo.
    echo Posibles causas:
    echo - La base de datos no existe
    echo - Credenciales incorrectas
    echo - PostgreSQL no esta corriendo
    echo - El archivo de backup tiene errores
    echo.
    echo Verifica los mensajes de error arriba.
)

echo.
pause

