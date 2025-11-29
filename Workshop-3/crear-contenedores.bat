@echo off
title Creando Contenedores Docker
color 0B

echo ============================================
echo   CREANDO CONTENEDORES DOCKER
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando Docker...
docker --version
if errorlevel 1 (
    echo ERROR: Docker no esta disponible. Por favor, inicia Docker Desktop.
    pause
    exit /b 1
)

echo.
echo Verificando docker-compose...
docker-compose --version
if errorlevel 1 (
    echo ERROR: docker-compose no esta disponible.
    pause
    exit /b 1
)

echo.
echo Construyendo imagenes y creando contenedores...
echo Esto puede tomar varios minutos la primera vez...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR al crear los contenedores
    echo Verifica los logs con: docker-compose logs
    pause
    exit /b 1
)

echo.
echo ============================================
echo Contenedores creados exitosamente!
echo ============================================
echo.
echo Verificando estado de los contenedores...
docker-compose ps

echo.
echo Para ver los logs:
echo   docker-compose logs -f
echo.
echo Para detener los contenedores:
echo   docker-compose down
echo.
echo Servicios disponibles:
echo   - MySQL (Java Backend): localhost:3307
echo   - PostgreSQL (Python Backend): localhost:5433
echo   - Java Backend API: http://localhost:8081
echo   - Python Backend API: http://localhost:8000
echo   - React Frontend: http://localhost:3000
echo.

pause

