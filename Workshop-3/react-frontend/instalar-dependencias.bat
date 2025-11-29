@echo off
echo ============================================
echo   INSTALANDO DEPENDENCIAS DEL FRONTEND
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando Node.js...
node --version
npm --version
echo.

echo Instalando todas las dependencias...
npm install

echo.
echo ============================================
echo   INSTALACION COMPLETADA
echo ============================================
echo.
echo Si hay errores, intenta:
echo   npm install --legacy-peer-deps
echo.
pause

