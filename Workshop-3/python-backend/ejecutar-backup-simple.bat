@echo off
REM Script simple para ejecutar el backup usando la contraseña del config.py
REM Usa la contraseña por defecto: 200127

echo ========================================
echo Restaurando Backup de Eventos
echo ========================================
echo.

cd /d "%~dp0"

REM Configuración desde config.py (valores por defecto)
set PGUSER=postgres
set PGPASSWORD=200127
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=eventplatform

echo Usando configuracion:
echo   Usuario: %PGUSER%
echo   Base de datos: %PGDATABASE%
echo   Archivo: Backup\Backup_Events.sql
echo.

echo Ejecutando backup...
echo NOTA: Este es un dump binario de pg_dump, usando pg_restore...
echo.
echo IMPORTANTE: Se te pedira la contraseña de PostgreSQL
echo Contraseña por defecto: 200127
echo.

REM El archivo es un dump binario (formato custom), usar pg_restore
REM --clean: Limpia objetos antes de crearlos
REM --if-exists: No falla si el objeto no existe
REM -v: Modo verbose para ver el progreso
REM -w: No pedir password (pero necesitamos establecer PGPASSWORD antes)
REM Establecer PGPASSWORD como variable de entorno del proceso actual
set PGPASSWORD=%PGPASSWORD%
pg_restore -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% --clean --if-exists -v Backup\Backup_Events.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [OK] Backup restaurado exitosamente!
    echo ========================================
    echo.
    echo La base de datos 'eventplatform' ha sido actualizada con el backup.
) else (
    echo.
    echo ========================================
    echo [ERROR] No se pudo restaurar el backup
    echo ========================================
    echo.
    echo Posibles soluciones:
    echo 1. Verifica que PostgreSQL este corriendo
    echo 2. Verifica que la base de datos 'eventplatform' exista
    echo 3. Verifica que la contraseña sea correcta (actual: 200127)
    echo 4. Si la contraseña es diferente, edita este script o usa ejecutar-backup.bat
    echo 5. Verifica que tengas permisos para restaurar en la base de datos
    echo.
)

pause

