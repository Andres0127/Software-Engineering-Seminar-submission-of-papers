@echo off
REM Script para ejecutar el backup con password en la línea de comando
REM Usa la opción -W para forzar prompt de password

echo ========================================
echo Restaurando Backup de Eventos
echo ========================================
echo.

cd /d "%~dp0"

REM Configuración
set PGUSER=postgres
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=eventplatform

echo Configuracion:
echo   Usuario: %PGUSER%
echo   Host: %PGHOST%
echo   Puerto: %PGPORT%
echo   Base de datos: %PGDATABASE%
echo   Archivo: Backup\Backup_Events.sql
echo.
echo NOTA: Este es un dump binario de pg_dump
echo Se usara pg_restore para restaurarlo
echo.
echo Se te pedira la contraseña de PostgreSQL
echo (Contraseña por defecto: 200127)
echo.

REM Ejecutar pg_restore
REM --clean: Limpia objetos antes de crearlos
REM --if-exists: No falla si el objeto no existe
REM -v: Modo verbose para ver el progreso
pg_restore -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% --clean --if-exists -v Backup\Backup_Events.sql
