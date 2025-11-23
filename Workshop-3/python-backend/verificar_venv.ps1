# Script para verificar si el entorno virtual está activado

Write-Host "`n=== Verificación del Entorno Virtual ===" -ForegroundColor Cyan

# Verificar si VIRTUAL_ENV está definido
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Entorno virtual ACTIVADO" -ForegroundColor Green
    Write-Host "   Ruta: $env:VIRTUAL_ENV" -ForegroundColor Gray
} else {
    Write-Host "❌ Entorno virtual NO ACTIVADO" -ForegroundColor Red
}

# Verificar la ruta de Python
Write-Host "`nPython ejecutable:" -ForegroundColor Yellow
python -c "import sys; print(sys.executable)"

# Verificar si es del .venv
$pythonPath = python -c "import sys; print(sys.executable)"
if ($pythonPath -like "*\.venv\Scripts\python.exe" -or $pythonPath -like "*/.venv/Scripts/python.exe") {
    Write-Host "✅ Python está usando el entorno virtual" -ForegroundColor Green
} else {
    Write-Host "❌ Python NO está usando el entorno virtual" -ForegroundColor Red
    Write-Host "   (Probablemente está usando Python global)" -ForegroundColor Gray
}

# Mostrar el prompt actual
Write-Host "`nPrompt actual:" -ForegroundColor Yellow
Write-Host $PSCommandPath -ForegroundColor Gray

Write-Host "`nPara activar el entorno virtual:" -ForegroundColor Cyan
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""



