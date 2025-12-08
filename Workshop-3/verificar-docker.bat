@echo off
echo ========================================
echo VERIFICACION DE DOCKER DESKTOP
echo ========================================
echo.

echo [1/4] Verificando si Docker esta instalado...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH
    echo.
    echo SOLUCION:
    echo   1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo   2. Reinicia tu computadora despues de la instalacion
    echo   3. Abre Docker Desktop y espera a que inicie completamente
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Docker encontrado
    docker --version
)
echo.

echo [2/4] Verificando si Docker Desktop esta ejecutandose...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop no esta ejecutandose
    echo.
    echo SOLUCION:
    echo   1. Abre Docker Desktop desde el menu de inicio
    echo   2. Espera a que muestre "Docker Desktop is running" en la bandeja del sistema
    echo   3. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Docker Desktop esta ejecutandose
)
echo.

echo [3/4] Verificando docker-compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] docker-compose no encontrado, pero Docker Desktop lo incluye
) else (
    echo [OK] docker-compose encontrado
    docker-compose --version
)
echo.

echo [4/4] Verificando conexion con el engine...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se puede conectar al Docker engine
    echo.
    echo SOLUCION:
    echo   1. Reinicia Docker Desktop
    echo   2. Espera 30 segundos y vuelve a intentar
    echo   3. Si persiste, reinicia tu computadora
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Conexion con Docker engine exitosa
    echo.
    echo Contenedores actuales:
    docker ps -a
)
echo.

echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Docker esta listo para usar!
echo.
echo Puedes ejecutar ahora:
echo   docker-comandos.bat build-up
echo   o
echo   dockerizar-proyecto.bat
echo.

pause



