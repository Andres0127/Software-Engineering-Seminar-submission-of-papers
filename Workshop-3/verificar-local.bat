@echo off
REM Script rápido para verificar que todo está listo para ejecutar localmente

echo ========================================
echo Verificacion Rapida - Event Platform
echo ========================================
echo.

set ERROR_COUNT=0

REM Verificar Java
echo [1/7] Verificando Java...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [X] Java NO encontrado
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
    echo    [OK] Java encontrado: %JAVA_VERSION%
)

REM Verificar Python
echo [2/7] Verificando Python...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [X] Python NO encontrado
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo    [OK] Python encontrado: %PYTHON_VERSION%
)

REM Verificar Node.js
echo [3/7] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [X] Node.js NO encontrado
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo    [OK] Node.js encontrado: %NODE_VERSION%
)

REM Verificar MySQL
echo [4/7] Verificando MySQL...
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [X] MySQL NO encontrado en PATH
    echo    [!] Asegurate de que MySQL este instalado y corriendo
) else (
    mysql --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] MySQL encontrado
        REM Intentar conectar
        mysql -u root -pRootPass -e "SELECT 1;" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo    [OK] Conexion a MySQL exitosa
            mysql -u root -pRootPass -e "SHOW DATABASES LIKE 'eventplatform_auth';" >nul 2>&1
            if %ERRORLEVEL% EQU 0 (
                echo    [OK] Base de datos 'eventplatform_auth' existe
            ) else (
                echo    [!] Base de datos 'eventplatform_auth' NO existe
                echo        Ejecuta: CREATE DATABASE eventplatform_auth;
            )
        ) else (
            echo    [!] No se pudo conectar a MySQL
            echo        Verifica usuario/password en application-local.properties
        )
    ) else (
        echo    [X] MySQL no responde
    )
)

REM Verificar PostgreSQL
echo [5/7] Verificando PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    [X] PostgreSQL NO encontrado en PATH
    echo    [!] Asegurate de que PostgreSQL este instalado y corriendo
) else (
    psql --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] PostgreSQL encontrado
        REM Intentar conectar
        psql -U postgres -d eventplatform -c "SELECT 1;" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo    [OK] Conexion a PostgreSQL exitosa
            echo    [OK] Base de datos 'eventplatform' existe
        ) else (
            echo    [!] No se pudo conectar a PostgreSQL
            echo        Verifica usuario/password en config.py
        )
    ) else (
        echo    [X] PostgreSQL no responde
    )
)

REM Verificar puertos disponibles
echo [6/7] Verificando puertos...
netstat -ano | findstr ":8081" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [!] Puerto 8081 (Java Backend) esta en uso
) else (
    echo    [OK] Puerto 8081 disponible
)

netstat -ano | findstr ":8000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [!] Puerto 8000 (Python Backend) esta en uso
) else (
    echo    [OK] Puerto 8000 disponible
)

netstat -ano | findstr ":3000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [!] Puerto 3000 (React Frontend) esta en uso
) else (
    echo    [OK] Puerto 3000 disponible
)

REM Verificar archivos importantes
echo [7/7] Verificando archivos del proyecto...
if exist "java-backend\pom.xml" (
    echo    [OK] Java Backend encontrado
) else (
    echo    [X] Java Backend NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "python-backend\main.py" (
    echo    [OK] Python Backend encontrado
) else (
    echo    [X] Python Backend NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "react-frontend\package.json" (
    echo    [OK] React Frontend encontrado
) else (
    echo    [X] React Frontend NO encontrado
    set /a ERROR_COUNT+=1
)

echo.
echo ========================================
echo Resumen
echo ========================================
if %ERROR_COUNT% EQU 0 (
    echo [OK] Todo listo para ejecutar!
    echo.
    echo Siguiente paso: Ejecuta .\ejecutar-local.bat
) else (
    echo [X] Se encontraron %ERROR_COUNT% problemas
    echo.
    echo Revisa los errores arriba y corrigelos antes de continuar.
)
echo.

pause

