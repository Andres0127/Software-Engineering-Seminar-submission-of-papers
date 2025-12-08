@echo off
echo ========================================
echo Ejecutando scripts de MySQL para Java Backend
echo ========================================
echo.

REM Verificar si el contenedor de MySQL esta corriendo
docker ps --filter "name=eventplatform-mysql" --format "{{.Names}}" | findstr /C:"eventplatform-mysql" >nul
if errorlevel 1 (
    echo Iniciando contenedor de MySQL...
    cd /d "%~dp0\..\.."
    docker-compose up -d mysql
    echo Esperando a que MySQL este listo...
    timeout /t 15 /nobreak >nul
)

echo.
echo Ejecutando script 01-create-database.sql...
cd /d "%~dp0"
docker exec -i eventplatform-mysql mysql -uroot -prootpassword < 01-create-database.sql
if errorlevel 1 (
    echo ERROR: Fallo al ejecutar 01-create-database.sql
    exit /b 1
)

echo.
echo Ejecutando script 02-seed-data.sql...
docker exec -i eventplatform-mysql mysql -uroot -prootpassword < 02-seed-data.sql
if errorlevel 1 (
    echo ERROR: Fallo al ejecutar 02-seed-data.sql
    exit /b 1
)

echo.
echo Verificando creacion de tablas...
docker exec eventplatform-mysql mysql -uroot -prootpassword -e "USE eventplatform_auth; SHOW TABLES;"

echo.
echo Verificando datos insertados...
docker exec eventplatform-mysql mysql -uroot -prootpassword -e "USE eventplatform_auth; SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type;"

echo.
echo ========================================
echo Scripts ejecutados exitosamente!
echo ========================================



