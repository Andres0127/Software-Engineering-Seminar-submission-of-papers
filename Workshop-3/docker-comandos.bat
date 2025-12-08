@echo off
REM Script para ejecutar comandos de Docker Compose desde linea de comandos
REM Uso: docker-comandos.bat [comando]
REM
REM Comandos disponibles:
REM   build-up    - Construir e iniciar contenedores
REM   up          - Iniciar contenedores
REM   down        - Detener contenedores
REM   restart     - Reiniciar contenedores
REM   logs        - Ver logs (puede seguir con -f para tiempo real)
REM   ps          - Ver estado
REM   clean       - Limpiar todo (contenedores, volumenes, imagenes)
REM   rebuild-java    - Reconstruir solo Java backend
REM   rebuild-python  - Reconstruir solo Python backend
REM   rebuild-react   - Reconstruir solo React frontend

setlocal enabledelayedexpansion

cd /d "%~dp0"

set COMMAND=%1

if "%COMMAND%"=="" (
    echo Uso: docker-comandos.bat [comando]
    echo.
    echo Comandos disponibles:
    echo   build-up    - Construir e iniciar contenedores
    echo   up          - Iniciar contenedores
    echo   down        - Detener contenedores
    echo   down-v      - Detener y eliminar volumenes
    echo   restart     - Reiniciar contenedores
    echo   logs        - Ver logs de todos los servicios
    echo   logs-f      - Ver logs en tiempo real
    echo   ps          - Ver estado de contenedores
    echo   clean       - Limpiar todo (contenedores, volumenes, imagenes)
    echo   build       - Reconstruir imagenes
    echo   rebuild-java    - Reconstruir solo Java backend
    echo   rebuild-python  - Reconstruir solo Python backend
    echo   rebuild-react   - Reconstruir solo React frontend
    echo.
    echo Ejemplos:
    echo   docker-comandos.bat build-up
    echo   docker-comandos.bat logs
    echo   docker-comandos.bat down
    exit /b 1
)

REM Verificar Docker
echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH.
    echo Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose no esta disponible.
    exit /b 1
)

REM Verificar que Docker este ejecutandose
docker info >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] Docker Desktop no parece estar ejecutandose.
    echo Esperando a que Docker este listo (maximo 30 segundos)...
    
    set TIMEOUT=30
    set COUNT=0
    :WAIT_DOCKER
    docker ps >nul 2>&1
    if not errorlevel 1 (
        echo Docker esta listo!
        goto :DOCKER_READY
    )
    
    set /a COUNT+=1
    if !COUNT! geq !TIMEOUT! (
        echo [ERROR] Docker no respondio en 30 segundos.
        echo Por favor, inicia Docker Desktop y vuelve a intentar.
        exit /b 1
    )
    
    echo Esperando... (!COUNT!/!TIMEOUT!)
    timeout /t 1 /nobreak >nul
    goto :WAIT_DOCKER
)
:DOCKER_READY

echo Docker esta listo.
echo Ejecutando: docker-compose %COMMAND%
echo.

if "%COMMAND%"=="build-up" (
    if not exist "docker-compose.yml" (
        echo [ERROR] No se encontro docker-compose.yml
        echo Ejecuta este script desde la carpeta Workshop-3
        exit /b 1
    )
    docker-compose up --build -d
    if errorlevel 1 (
        echo.
        echo [ERROR] Fallo al construir/iniciar contenedores
        echo Verifica los logs con: docker-compose logs
        exit /b 1
    )
    echo.
    echo Contenedores creados e iniciados exitosamente!
    timeout /t 2 /nobreak >nul
    docker-compose ps
    goto :SHOW_INFO
)

if "%COMMAND%"=="up" (
    if not exist "docker-compose.yml" (
        echo [ERROR] No se encontro docker-compose.yml
        echo Ejecuta este script desde la carpeta Workshop-3
        exit /b 1
    )
    docker-compose up -d
    if errorlevel 1 (
        echo [ERROR] Fallo al iniciar contenedores
        echo Verifica los logs con: docker-compose logs
        exit /b 1
    )
    echo Contenedores iniciados exitosamente!
    docker-compose ps
    goto :SHOW_INFO
)

if "%COMMAND%"=="down" (
    docker-compose down
    if errorlevel 1 exit /b 1
    echo Contenedores detenidos exitosamente!
    goto :END
)

if "%COMMAND%"=="down-v" (
    echo ADVERTENCIA: Esto eliminara todos los datos de las bases de datos!
    set /p CONFIRM="Esta seguro? (S/N): "
    if /i not "!CONFIRM!"=="S" (
        echo Operacion cancelada.
        goto :END
    )
    docker-compose down -v
    if errorlevel 1 exit /b 1
    echo Contenedores y volumenes eliminados exitosamente!
    goto :END
)

if "%COMMAND%"=="restart" (
    docker-compose restart
    if errorlevel 1 exit /b 1
    echo Servicios reiniciados exitosamente!
    docker-compose ps
    goto :SHOW_INFO
)

if "%COMMAND%"=="logs" (
    docker-compose logs --tail=100
    goto :END
)

if "%COMMAND%"=="logs-f" (
    echo Presione Ctrl+C para salir de los logs
    docker-compose logs -f
    goto :END
)

if "%COMMAND%"=="ps" (
    docker-compose ps
    goto :END
)

if "%COMMAND%"=="clean" (
    echo ADVERTENCIA: Esto eliminara contenedores, volumenes e imagenes!
    set /p CONFIRM="Escriba 'SI' para confirmar: "
    if not "!CONFIRM!"=="SI" (
        echo Operacion cancelada.
        goto :END
    )
    docker-compose down -v --rmi all
    echo Limpieza completada!
    goto :END
)

if "%COMMAND%"=="build" (
    docker-compose build --no-cache
    if errorlevel 1 exit /b 1
    echo Imagenes reconstruidas exitosamente!
    goto :END
)

if "%COMMAND%"=="rebuild-java" (
    echo Reconstruyendo Java backend...
    docker-compose up -d --build java-backend
    if errorlevel 1 exit /b 1
    echo Java backend reconstruido e iniciado exitosamente!
    docker-compose ps java-backend
    goto :END
)

if "%COMMAND%"=="rebuild-python" (
    echo Reconstruyendo Python backend...
    docker-compose up -d --build python-backend
    if errorlevel 1 exit /b 1
    echo Python backend reconstruido e iniciado exitosamente!
    docker-compose ps python-backend
    goto :END
)

if "%COMMAND%"=="rebuild-react" (
    echo Reconstruyendo React frontend...
    docker-compose up -d --build react-frontend
    if errorlevel 1 exit /b 1
    echo React frontend reconstruido e iniciado exitosamente!
    docker-compose ps react-frontend
    goto :END
)

echo Comando desconocido: %COMMAND%
echo Ejecute sin parametros para ver ayuda.
exit /b 1

:SHOW_INFO
echo.
echo ============================================
echo   SERVICIOS DISPONIBLES
echo ============================================
echo   MySQL (Java Backend):     localhost:3307
echo   PostgreSQL (Python):      localhost:5433
echo   Java Backend API:         http://localhost:8081
echo   Python Backend API:       http://localhost:8000
echo   React Frontend:           http://localhost:3000
echo.

:END
exit /b 0

