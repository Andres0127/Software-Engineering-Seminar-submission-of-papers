@echo off
echo ========================================
echo VERIFICACION DE DOCKER
echo ========================================
echo.

echo [1/5] Verificando Docker...
docker --version
if errorlevel 1 (
    echo ERROR: Docker no esta disponible
) else (
    echo Docker encontrado correctamente
)
echo.

echo [2/5] Listando contenedores...
docker ps -a
echo.

echo [3/5] Listando imagenes...
docker images
echo.

echo [4/5] Verificando docker-compose...
cd /d "%~dp0"
docker-compose ps
echo.

echo [5/5] Listando redes...
docker network ls
echo.

echo ========================================
echo Verificacion completada
echo ========================================
echo.
echo Para crear los contenedores ejecuta:
echo   crear-contenedores.bat
echo.

pause

