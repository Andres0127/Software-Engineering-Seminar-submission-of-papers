@echo off
title Iniciar Java Backend Local
color 0A

echo ========================================
echo   INICIANDO JAVA BACKEND (LOCAL)
echo ========================================
echo.

cd /d "%~dp0\java-backend"

REM Verificar si MySQL esta corriendo
echo Verificando MySQL en localhost:3306...
mysql -u root -p200127 -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: No se puede conectar a MySQL en localhost:3306
    echo.
    echo Por favor asegurate de que:
    echo   1. MySQL este instalado y corriendo
    echo   2. El usuario sea: root
    echo   3. La contraseña sea: 200127
    echo   4. MySQL este escuchando en el puerto 3306
    echo.
    echo Si MySQL no esta corriendo, inicialo desde los servicios de Windows
    echo o ejecuta: net start MySQL
    echo.
    pause
    exit /b 1
)

echo MySQL esta corriendo ✓
echo.

REM Verificar si la base de datos existe
echo Verificando base de datos eventplatform_auth...
mysql -u root -p200127 -e "USE eventplatform_auth;" >nul 2>&1
if errorlevel 1 (
    echo La base de datos no existe. Creandola...
    mysql -u root -p200127 < scripts\01-create-database.sql
    if errorlevel 1 (
        echo ERROR: No se pudo crear la base de datos
        pause
        exit /b 1
    )
    echo Base de datos creada ✓
    echo.
    echo Insertando datos iniciales...
    mysql -u root -p200127 < scripts\02-seed-data.sql
    echo Datos iniciales insertados ✓
    echo.
)

REM Verificar si existe Maven wrapper
if exist "mvnw.cmd" (
    echo Usando Maven wrapper (mvnw)...
    echo.
    echo Compilando proyecto (esto puede tomar unos minutos la primera vez)...
    call mvnw.cmd clean install -DskipTests
    if errorlevel 1 (
        echo.
        echo ERROR: Fallo la compilacion del proyecto
        echo Verifica los errores arriba
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo Iniciando servidor Spring Boot...
    echo ========================================
    echo.
    echo El backend estara disponible en: http://localhost:8081
    echo Swagger UI: http://localhost:8081/swagger-ui.html
    echo.
    call mvnw.cmd spring-boot:run
) else (
    REM Verificar si Maven esta instalado
    where mvn >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Maven no esta instalado y no se encontro mvnw.cmd
        echo.
        echo Opciones:
        echo   1. Instala Maven y agregalo al PATH
        echo   2. O descarga el Maven wrapper ejecutando:
        echo      mvn wrapper:wrapper
        echo.
        pause
        exit /b 1
    )
    echo Usando Maven del sistema...
    echo.
    echo Compilando proyecto (esto puede tomar unos minutos la primera vez)...
    call mvn clean install -DskipTests
    if errorlevel 1 (
        echo.
        echo ERROR: Fallo la compilacion del proyecto
        echo Verifica los errores arriba
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo Iniciando servidor Spring Boot...
    echo ========================================
    echo.
    echo El backend estara disponible en: http://localhost:8081
    echo Swagger UI: http://localhost:8081/swagger-ui.html
    echo.
    call mvn spring-boot:run
)

