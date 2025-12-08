@echo off
REM Script para ejecutar el proyecto localmente
REM Este script verifica prerequisitos y ayuda a iniciar los servicios

echo ========================================
echo Event Platform - Ejecucion Local
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "java-backend" (
    echo ERROR: Este script debe ejecutarse desde Workshop-3
    echo Cambia al directorio Workshop-3 y vuelve a intentar
    pause
    exit /b 1
)

echo Verificando prerequisitos...
echo.

REM Verificar Java
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Java no encontrado. Por favor instala Java 17+
    echo.
) else (
    echo [OK] Java encontrado
    java -version 2>&1 | findstr /i "version"
)

REM Verificar Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python no encontrado. Por favor instala Python 3.12+
    echo.
) else (
    echo [OK] Python encontrado
    python --version
)

REM Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js no encontrado. Por favor instala Node.js 16+
    echo.
) else (
    echo [OK] Node.js encontrado
    node --version
)

REM Verificar Maven (o usar mvnw)
if exist "java-backend\mvnw.cmd" (
    echo [OK] Maven wrapper encontrado
) else (
    where mvn >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Maven no encontrado. Se usara mvnw si esta disponible
    ) else (
        echo [OK] Maven encontrado
    )
)

REM Verificar Poetry
where poetry >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Poetry no encontrado. Se intentara usar pip
    echo.
) else (
    echo [OK] Poetry encontrado
    poetry --version
)

echo.
echo ========================================
echo Menu de Opciones
echo ========================================
echo.
echo [1] Verificar bases de datos (MySQL y PostgreSQL)
echo [2] Iniciar Java Backend
echo [3] Iniciar Python Backend
echo [4] Iniciar React Frontend
echo [5] Iniciar TODOS los servicios (abre 3 ventanas)
echo [6] Verificar que los servicios estan corriendo
echo [7] Salir
echo.
set /p opcion="Selecciona una opcion (1-7): "

if "%opcion%"=="1" goto verificar_bd
if "%opcion%"=="2" goto iniciar_java
if "%opcion%"=="3" goto iniciar_python
if "%opcion%"=="4" goto iniciar_react
if "%opcion%"=="5" goto iniciar_todos
if "%opcion%"=="6" goto verificar_servicios
if "%opcion%"=="7" goto fin
goto menu

:verificar_bd
echo.
echo ========================================
echo Verificando Bases de Datos
echo ========================================
echo.
echo Verificando MySQL...
mysql -u root -p -e "SHOW DATABASES LIKE 'eventplatform_auth';" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MySQL esta corriendo y la base de datos existe
) else (
    echo [X] MySQL no esta corriendo o la base de datos no existe
    echo.
    echo Para crear la base de datos:
    echo    mysql -u root -p
    echo    CREATE DATABASE eventplatform_auth;
    echo    exit
)
echo.
echo Verificando PostgreSQL...
psql -U postgres -d eventplatform -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL esta corriendo y la base de datos existe
) else (
    echo [X] PostgreSQL no esta corriendo o la base de datos no existe
    echo.
    echo Para crear la base de datos:
    echo    cd python-backend\scripts
    echo    psql -U postgres -f 01-create-database.sql
    echo    psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
)
echo.
pause
goto menu

:iniciar_java
echo.
echo ========================================
echo Iniciando Java Backend
echo ========================================
echo.
cd java-backend
if exist "mvnw.cmd" (
    echo Usando Maven wrapper...
    call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
) else (
    echo Usando Maven instalado...
    mvn spring-boot:run -Dspring-boot.run.profiles=local
)
cd ..
goto fin

:iniciar_python
echo.
echo ========================================
echo Iniciando Python Backend
echo ========================================
echo.
cd python-backend
if exist "pyproject.toml" (
    where poetry >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Usando Poetry...
        poetry install
        poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ) else (
        echo Poetry no encontrado, usando pip...
        pip install -r requirements.txt
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
    )
) else (
    echo ERROR: pyproject.toml no encontrado
)
cd ..
goto fin

:iniciar_react
echo.
echo ========================================
echo Iniciando React Frontend
echo ========================================
echo.
cd react-frontend
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)
echo Iniciando servidor de desarrollo...
call npm start
cd ..
goto fin

:iniciar_todos
echo.
echo ========================================
echo Iniciando TODOS los servicios
echo ========================================
echo.
echo Se abriran 3 ventanas de terminal, una para cada servicio.
echo.
echo IMPORTANTE: Asegurate de que MySQL y PostgreSQL esten corriendo antes de continuar.
echo.
pause

REM Iniciar Java Backend en nueva ventana
start "Java Backend - Port 8081" cmd /k "cd /d %~dp0java-backend && if exist mvnw.cmd (call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local) else (mvn spring-boot:run -Dspring-boot.run.profiles=local)"

REM Esperar un poco antes de iniciar el siguiente
timeout /t 5 /nobreak >nul

REM Iniciar Python Backend en nueva ventana
start "Python Backend - Port 8000" cmd /k "cd /d %~dp0python-backend && if exist pyproject.toml (if exist poetry (poetry install && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000) else (pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000)) else (echo ERROR: pyproject.toml no encontrado && pause)"

REM Esperar un poco antes de iniciar el siguiente
timeout /t 5 /nobreak >nul

REM Iniciar React Frontend en nueva ventana
start "React Frontend - Port 3000" cmd /k "cd /d %~dp0react-frontend && if not exist node_modules (call npm install) && call npm start"

echo.
echo ========================================
echo Servicios iniciados
echo ========================================
echo.
echo Java Backend: http://localhost:8081
echo Python Backend: http://localhost:8000
echo React Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
goto fin

:verificar_servicios
echo.
echo ========================================
echo Verificando Servicios
echo ========================================
echo.

REM Verificar Java Backend
curl -s http://localhost:8081/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Java Backend esta corriendo en http://localhost:8081
) else (
    echo [X] Java Backend NO esta corriendo
)

REM Verificar Python Backend
curl -s http://localhost:8000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python Backend esta corriendo en http://localhost:8000
) else (
    echo [X] Python Backend NO esta corriendo
)

REM Verificar React Frontend
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] React Frontend esta corriendo en http://localhost:3000
) else (
    echo [X] React Frontend NO esta corriendo
)

echo.
pause
goto menu

:fin
echo.
echo Saliendo...
exit /b 0

