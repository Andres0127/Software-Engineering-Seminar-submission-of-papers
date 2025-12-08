@echo off
echo ============================================
echo   INSTALANDO DEPENDENCIAS DEL BACKEND PYTHON
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando Python...
python --version
echo.

echo Instalando email-validator...
python -m pip install email-validator

echo.
echo Instalando todas las dependencias desde requirements.txt...
python -m pip install -r requirements.txt

echo.
echo ============================================
echo   INSTALACION COMPLETADA
echo ============================================
echo.
echo Si usas Poetry, ejecuta:
echo   poetry install
echo   poetry add email-validator
echo.
pause



