# Script to confirm whether the virtual environment is active

Write-Host "`n=== Virtual Environment Check ===" -ForegroundColor Cyan

# Check if VIRTUAL_ENV is set
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Virtual environment DETECTED" -ForegroundColor Green
    Write-Host "   Path: $env:VIRTUAL_ENV" -ForegroundColor Gray
} else {
    Write-Host "❌ Virtual environment NOT DETECTED" -ForegroundColor Red
}

# Show Python executable
Write-Host "`nPython executable:" -ForegroundColor Yellow
python -c "import sys; print(sys.executable)"

# Check if Python comes from the .venv
$pythonPath = python -c "import sys; print(sys.executable)"
if ($pythonPath -like "*\.venv\Scripts\python.exe" -or $pythonPath -like "*/.venv/Scripts/python.exe") {
    Write-Host "✅ Python is using the virtual environment" -ForegroundColor Green
} else {
    Write-Host "❌ Python is NOT using the virtual environment" -ForegroundColor Red
    Write-Host "   (It is probably using the system-wide Python)" -ForegroundColor Gray
}

# Display the current script path
Write-Host "`nCurrent prompt:" -ForegroundColor Yellow
Write-Host $PSCommandPath -ForegroundColor Gray

Write-Host "`nTo activate the virtual environment:" -ForegroundColor Cyan
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""