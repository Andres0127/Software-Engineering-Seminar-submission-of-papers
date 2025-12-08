@echo off
echo ============================================
echo   INSTALANDO email-validator
echo ============================================
echo.

cd /d "%~dp0"

echo Instalando email-validator usando Poetry...
python -m poetry add email-validator

echo.
echo Actualizando dependencias...
python -m poetry install

echo.
echo Instalando directamente en el entorno virtual...
python -m poetry run pip install email-validator

echo.
echo ============================================
echo   INSTALACION COMPLETADA
echo ============================================
echo.
echo Verificando instalacion...
python -m poetry run python -c "import email_validator; print('✓ email-validator instalado correctamente')"

echo.
pause



