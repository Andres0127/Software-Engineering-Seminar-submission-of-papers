@echo off
echo ========================================
echo Iniciando Java Backend
echo ========================================
echo.

cd /d "%~dp0"

REM Opcion 1: Usar Docker
echo Verificando si usar Docker o ejecucion local...
docker ps --filter "name=eventplatform-mysql" --format "{{.Names}}" | findstr /C:"eventplatform-mysql" >nul
if not errorlevel 1 (
    echo MySQL en Docker detectado. Iniciando backend con Docker...
    docker-compose up -d mysql java-backend
    echo.
    echo Esperando a que el backend este listo...
    timeout /t 20 /nobreak >nul
    echo.
    echo Verificando estado...
    docker-compose ps java-backend
    echo.
    echo Backend iniciado! Verifica los logs con:
    echo   docker-compose logs -f java-backend
    echo.
    echo El backend deberia estar disponible en: http://localhost:8081
    pause
    exit /b 0
)

REM Opcion 2: Ejecucion local
echo MySQL en Docker no detectado. Iniciando backend localmente...
echo.
echo NOTA: Asegurate de que MySQL este corriendo en localhost:3306
echo       Usuario: root, Password: 200127
echo.

cd java-backend

REM Verificar si existe mvnw (Maven wrapper)
if exist "mvnw.cmd" (
    echo Usando Maven wrapper...
    call mvnw.cmd clean install -DskipTests
    if errorlevel 1 (
        echo ERROR: Fallo la compilacion
        pause
        exit /b 1
    )
    echo.
    echo Iniciando aplicacion...
    call mvnw.cmd spring-boot:run
) else (
    REM Usar Maven del sistema
    where mvn >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Maven no esta instalado y no se encontro mvnw.cmd
        echo Por favor instala Maven o usa Docker
        pause
        exit /b 1
    )
    echo Compilando proyecto...
    call mvn clean install -DskipTests
    if errorlevel 1 (
        echo ERROR: Fallo la compilacion
        pause
        exit /b 1
    )
    echo.
    echo Iniciando aplicacion...
    call mvn spring-boot:run
)



