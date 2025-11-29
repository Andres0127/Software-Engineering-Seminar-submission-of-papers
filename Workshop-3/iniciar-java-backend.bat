@echo off
echo ========================================
echo Iniciando Java Backend (Spring Boot)
echo ========================================
echo.

cd /d "%~dp0\java-backend"

REM Verificar si Maven esta disponible
where mvn >nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven no esta instalado o no esta en el PATH
    echo Por favor instala Maven o usa el wrapper: mvnw
    exit /b 1
)

REM Verificar si MySQL esta corriendo (Docker o local)
echo Verificando conexion a MySQL...
docker ps --filter "name=eventplatform-mysql" --format "{{.Names}}" | findstr /C:"eventplatform-mysql" >nul
if errorlevel 1 (
    echo MySQL en Docker no esta corriendo. Iniciando...
    cd /d "%~dp0"
    docker-compose up -d mysql
    echo Esperando a que MySQL este listo...
    timeout /t 10 /nobreak >nul
    cd /d "%~dp0\java-backend"
)

echo.
echo Compilando proyecto...
call mvn clean install -DskipTests

if errorlevel 1 (
    echo ERROR: Fallo la compilacion
    exit /b 1
)

echo.
echo Iniciando aplicacion Spring Boot...
echo El servidor estara disponible en: http://localhost:8081
echo.
call mvn spring-boot:run

