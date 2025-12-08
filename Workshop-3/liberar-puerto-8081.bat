@echo off
echo ========================================
echo LIBERAR PUERTO 8081
echo ========================================
echo.

echo [1/3] Buscando procesos que usan el puerto 8081...
netstat -ano | findstr :8081
echo.

echo [2/3] Obteniendo PID del proceso...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    set PID=%%a
    echo PID encontrado: %%a
    echo.
    echo [3/3] Deteniendo proceso...
    taskkill /PID %%a /F
    if errorlevel 1 (
        echo ERROR: No se pudo detener el proceso. Puede requerir permisos de administrador.
        echo Intenta ejecutar este script como administrador.
    ) else (
        echo Proceso detenido exitosamente!
    )
    goto :FOUND
)

echo No se encontro ningun proceso usando el puerto 8081.
echo El puerto esta libre.

:FOUND
echo.
echo ========================================
echo Verificando contenedores Docker...
echo ========================================
docker ps -a | findstr 8081
echo.

echo Si hay contenedores Docker usando el puerto, detenlos con:
echo   docker-compose down
echo.

pause



