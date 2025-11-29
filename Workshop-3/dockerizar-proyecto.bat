@echo off
setlocal enabledelayedexpansion
title Dockerizacion del Proyecto Event Platform
color 0B

cd /d "%~dp0"

REM Verificar si se pasó un argumento
set ACTION=%1
if "%ACTION%"=="" goto MENU
goto :%ACTION%

:MENU
echo ============================================
echo   DOCKERIZACION DEL PROYECTO EVENT PLATFORM
echo ============================================
echo.
echo Opciones disponibles:
echo.
echo   [1] Crear y construir contenedores (build + up)
echo   [2] Iniciar contenedores (up)
echo   [3] Detener contenedores (down)
echo   [4] Detener y eliminar volumenes (down -v)
echo   [5] Ver logs de todos los servicios
echo   [6] Ver logs de un servicio especifico
echo   [7] Ver estado de contenedores (ps)
echo   [8] Reconstruir contenedores (build --no-cache)
echo   [9] Limpiar todo (stop, remove, volumes, images)
echo  [10] Ver logs en tiempo real (logs -f)
echo  [11] Reiniciar todos los servicios
echo  [12] Entrar a un contenedor (exec)
echo  [13] Ver informacion de servicios
echo  [0] Salir
echo.
set /p OPTION="Seleccione una opcion (0-13): "

if "%OPTION%"=="1" goto BUILD_UP
if "%OPTION%"=="2" goto UP
if "%OPTION%"=="3" goto DOWN
if "%OPTION%"=="4" goto DOWN_VOLUMES
if "%OPTION%"=="5" goto LOGS_ALL
if "%OPTION%"=="6" goto LOGS_SERVICE
if "%OPTION%"=="7" goto PS
if "%OPTION%"=="8" goto BUILD_NO_CACHE
if "%OPTION%"=="9" goto CLEAN_ALL
if "%OPTION%"=="10" goto LOGS_FOLLOW
if "%OPTION%"=="11" goto RESTART
if "%OPTION%"=="12" goto EXEC
if "%OPTION%"=="13" goto INFO
if "%OPTION%"=="0" goto END
echo Opcion invalida.
pause
goto MENU

:CHECK_DOCKER
echo Verificando Docker
echo.

REM Verificar que Docker este instalado
where docker >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    echo Por favor, instala Docker Desktop
    echo.
    pause
    exit /b 1
)
echo OK: Docker encontrado

REM Verificar que docker-compose este disponible
where docker-compose >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose no esta disponible
    echo Asegurate de tener Docker Desktop instalado
    echo.
    pause
    exit /b 1
)
echo OK: Docker Compose encontrado

REM Verificar que Docker Desktop este ejecutandose
echo.
echo Verificando que Docker Desktop este ejecutandose
docker info >nul 2>&1
if errorlevel 1 (
    echo ADVERTENCIA: Docker Desktop no parece estar ejecutandose
    echo Esperando a que Docker este listo (maximo 30 segundos)
    echo.
    
    set TIMEOUT=30
    set COUNT=0
    :WAIT_DOCKER
    docker ps >nul 2>&1
    if not errorlevel 1 (
        echo OK: Docker esta listo!
        goto DOCKER_READY
    )
    
    set /a COUNT+=1
    if !COUNT! GTR 29 (
        echo.
        echo ERROR: Docker no respondio en 30 segundos
        echo.
        echo SOLUCION: Abre Docker Desktop y vuelve a ejecutar este script
        echo.
        pause
        exit /b 1
    )
    
    echo Esperando !COUNT! de !TIMEOUT! segundos
    timeout /t 1 /nobreak >nul
    goto WAIT_DOCKER
) else (
    echo OK: Docker Desktop esta ejecutandose correctamente
)

:DOCKER_READY
echo.
goto :eof

:BUILD_UP
call :CHECK_DOCKER
echo ============================================
echo   CONSTRUYENDO E INICIANDO CONTENEDORES
echo ============================================
echo.
echo Esto puede tomar varios minutos la primera vez
echo.

REM Verificar que el archivo docker-compose.yml existe
if not exist "docker-compose.yml" (
    echo ERROR: No se encontro el archivo docker-compose.yml
    echo Asegurate de ejecutar este script desde la carpeta Workshop-3
    echo.
    pause
    goto MENU
)

echo Construyendo imagenes y creando contenedores
echo.
docker-compose up --build -d
set BUILD_ERROR=%ERRORLEVEL%

if errorlevel 1 (
    echo.
    echo ============================================
    echo ERROR: FALLO AL CONSTRUIR/INICIAR CONTENEDORES
    echo ============================================
    echo.
    echo Posibles causas:
    echo   1. Docker Desktop no esta completamente iniciado
    echo   2. Problemas de red o conectividad
    echo   3. Puertos ya en uso
    echo   4. Error en la construccion de una imagen
    echo   5. Problemas con el espacio en disco
    echo.
    echo SOLUCIONES:
    echo.
    echo 1. Verifica el estado de Docker:
    echo    - Abre Docker Desktop
    echo    - Espera a que muestre "Docker Desktop is running"
    echo.
    echo 2. Verifica los logs detallados:
    echo    - Selecciona la opcion [5] o [10] de este menu
    echo    - O ejecuta: docker-compose logs
    echo.
    echo 3. Verifica si hay puertos en uso:
    echo    - Puerto 3000: netstat -ano ^| findstr :3000
    echo    - Puerto 8000: netstat -ano ^| findstr :8000
    echo    - Puerto 8081: netstat -ano ^| findstr :8081
    echo    - Puerto 3307: netstat -ano ^| findstr :3307
    echo    - Puerto 5433: netstat -ano ^| findstr :5433
    echo.
    echo 4. Intenta limpiar y volver a construir:
    echo    - Selecciona la opcion [9] para limpiar todo
    echo    - Luego vuelve a intentar con la opcion [1]
    echo.
    echo 5. Verifica el espacio en disco disponible
    echo.
    echo Mostrando ultimos logs de error:
    echo ============================================
    docker-compose logs --tail=50
    echo ============================================
    echo.
    pause
    goto MENU
)

REM Verificar que los contenedores se iniciaron correctamente
echo.
echo Verificando estado de contenedores
timeout /t 3 /nobreak >nul
docker-compose ps

echo.
echo ============================================
echo Contenedores creados e iniciados exitosamente!
echo ============================================
call :SHOW_INFO
goto MENU

:UP
call :CHECK_DOCKER
echo ============================================
echo   INICIANDO CONTENEDORES
echo ============================================
echo.

REM Verificar que el archivo docker-compose.yml existe
if not exist "docker-compose.yml" (
    echo ERROR: No se encontro el archivo docker-compose.yml
    echo Asegurate de ejecutar este script desde la carpeta Workshop-3
    echo.
    pause
    goto MENU
)

docker-compose up -d
if errorlevel 1 (
    echo.
    echo ERROR: FALLO AL INICIAR CONTENEDORES
    echo.
    echo Verifica los logs con la opcion [5] o [10]
    echo O ejecuta: docker-compose logs
    echo.
    pause
    goto MENU
)
echo.
echo Contenedores iniciados exitosamente!
call :SHOW_INFO
goto MENU

:DOWN
call :CHECK_DOCKER
echo ============================================
echo   DETENIENDO CONTENEDORES
echo ============================================
echo.
docker-compose down
if errorlevel 1 (
    echo.
    echo ERROR al detener los contenedores
    pause
    goto MENU
)
echo.
echo Contenedores detenidos exitosamente!
goto MENU

:DOWN_VOLUMES
call :CHECK_DOCKER
echo ============================================
echo   DETENIENDO Y ELIMINANDO VOLUMENES
echo ============================================
echo.
echo ADVERTENCIA: Esto eliminara todos los datos de las bases de datos!
set /p CONFIRM="Esta seguro? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Operacion cancelada.
    pause
    goto MENU
)
docker-compose down -v
if errorlevel 1 (
    echo.
    echo ERROR al detener los contenedores y volumenes
    pause
    goto MENU
)
echo.
echo Contenedores y volumenes eliminados exitosamente!
goto MENU

:LOGS_ALL
call :CHECK_DOCKER
echo ============================================
echo   LOGS DE TODOS LOS SERVICIOS
echo ============================================
echo.
docker-compose logs --tail=100
echo.
pause
goto MENU

:LOGS_SERVICE
call :CHECK_DOCKER
echo ============================================
echo   LOGS DE UN SERVICIO ESPECIFICO
echo ============================================
echo.
echo Servicios disponibles:
echo   1. mysql
echo   2. postgres
echo   3. java-backend
echo   4. python-backend
echo   5. react-frontend
echo.
set /p SERVICE_OPTION="Seleccione el numero del servicio: "

if "%SERVICE_OPTION%"=="1" set SERVICE_NAME=mysql
if "%SERVICE_OPTION%"=="2" set SERVICE_NAME=postgres
if "%SERVICE_OPTION%"=="3" set SERVICE_NAME=java-backend
if "%SERVICE_OPTION%"=="4" set SERVICE_NAME=python-backend
if "%SERVICE_OPTION%"=="5" set SERVICE_NAME=react-frontend

if "%SERVICE_NAME%"=="" (
    echo Opcion invalida.
    pause
    goto MENU
)

echo.
echo Mostrando logs de %SERVICE_NAME%
echo.
docker-compose logs --tail=100 %SERVICE_NAME%
echo.
pause
goto MENU

:LOGS_FOLLOW
call :CHECK_DOCKER
echo ============================================
echo   LOGS EN TIEMPO REAL
echo ============================================
echo.
echo Presione Ctrl+C para salir de los logs
echo.
docker-compose logs -f
goto MENU

:PS
call :CHECK_DOCKER
echo ============================================
echo   ESTADO DE CONTENEDORES
echo ============================================
echo.
docker-compose ps
echo.
pause
goto MENU

:BUILD_NO_CACHE
call :CHECK_DOCKER
echo ============================================
echo   RECONSTRUYENDO CONTENEDORES (SIN CACHE)
echo ============================================
echo.
echo Esto reconstruira todas las imagenes desde cero...
echo Puede tomar varios minutos...
echo.
docker-compose build --no-cache
if errorlevel 1 (
    echo.
    echo ERROR al reconstruir las imagenes
    pause
    goto MENU
)
echo.
echo Imagenes reconstruidas exitosamente!
echo.
set /p START_NOW="Desea iniciar los contenedores ahora? (S/N): "
if /i "%START_NOW%"=="S" (
    docker-compose up -d
    call :SHOW_INFO
)
goto MENU

:CLEAN_ALL
call :CHECK_DOCKER
echo ============================================
echo   LIMPIEZA COMPLETA DEL PROYECTO
echo ============================================
echo.
echo ADVERTENCIA: Esto eliminara:
echo   - Todos los contenedores
echo   - Todos los volumenes (incluye datos de BD)
echo   - Todas las imagenes del proyecto
echo.
set /p CONFIRM="Esta completamente seguro? Escriba 'SI' para confirmar: "
if not "%CONFIRM%"=="SI" (
    echo Operacion cancelada.
    pause
    goto MENU
)
echo.
echo Deteniendo y eliminando contenedores...
docker-compose down -v --rmi all
if errorlevel 1 (
    echo Algunos recursos ya no existian o hubo un error parcial
)
echo.
echo Limpieza completada!
goto MENU

:RESTART
call :CHECK_DOCKER
echo ============================================
echo   REINICIANDO TODOS LOS SERVICIOS
echo ============================================
echo.
docker-compose restart
if errorlevel 1 (
    echo.
    echo ERROR al reiniciar los servicios
    pause
    goto MENU
)
echo.
echo Servicios reiniciados exitosamente!
call :SHOW_INFO
goto MENU

:EXEC
call :CHECK_DOCKER
echo ============================================
echo   ENTRAR A UN CONTENEDOR
echo ============================================
echo.
echo Servicios disponibles:
echo   1. mysql
echo   2. postgres
echo   3. java-backend
echo   4. python-backend
echo   5. react-frontend
echo.
set /p SERVICE_OPTION="Seleccione el numero del servicio: "

if "%SERVICE_OPTION%"=="1" (
    set SERVICE_NAME=mysql
    set SHELL_CMD=/bin/bash
)
if "%SERVICE_OPTION%"=="2" (
    set SERVICE_NAME=postgres
    set SHELL_CMD=/bin/sh
)
if "%SERVICE_OPTION%"=="3" (
    set SERVICE_NAME=java-backend
    set SHELL_CMD=/bin/sh
)
if "%SERVICE_OPTION%"=="4" (
    set SERVICE_NAME=python-backend
    set SHELL_CMD=/bin/sh
)
if "%SERVICE_OPTION%"=="5" (
    set SERVICE_NAME=react-frontend
    set SHELL_CMD=/bin/sh
)

if "%SERVICE_NAME%"=="" (
    echo Opcion invalida.
    pause
    goto MENU
)

echo.
echo Entrando al contenedor %SERVICE_NAME%...
echo Escriba 'exit' para salir
echo.
docker-compose exec %SERVICE_NAME% %SHELL_CMD%
goto MENU

:INFO
call :SHOW_INFO
pause
goto MENU

:SHOW_INFO
echo.
echo ============================================
echo   INFORMACION DE SERVICIOS
echo ============================================
echo.
echo Estado de contenedores:
docker-compose ps
echo.
echo Servicios disponibles:
echo   - MySQL (Java Backend):     localhost:3307
echo   - PostgreSQL (Python):      localhost:5433
echo   - Java Backend API:         http://localhost:8081
echo   - Python Backend API:       http://localhost:8000
echo   - React Frontend:           http://localhost:3000
echo.
echo Documentacion API:
echo   - Java Backend Swagger:     http://localhost:8081/swagger-ui.html
echo   - Python Backend Docs:      http://localhost:8000/docs
echo   - Python Backend ReDoc:     http://localhost:8000/redoc
echo.
goto :eof

:END
echo.
echo Saliendo...
exit /b 0

