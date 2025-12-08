@echo off
REM Build script for Workshop-4-Report.tex
REM This script compiles the LaTeX document twice to resolve all references

echo ========================================
echo Building Workshop-4-Report.pdf
echo ========================================
echo.

echo [1/2] First compilation pass...
pdflatex -interaction=nonstopmode Workshop-4-Report.tex
if errorlevel 1 (
    echo.
    echo ERROR: First compilation failed!
    echo Please check the log file for errors.
    pause
    exit /b 1
)

echo.
echo [2/2] Second compilation pass (resolving references)...
pdflatex -interaction=nonstopmode Workshop-4-Report.tex
if errorlevel 1 (
    echo.
    echo ERROR: Second compilation failed!
    echo Please check the log file for errors.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo Output: Workshop-4-Report.pdf
echo ========================================
echo.

REM Clean up auxiliary files (optional - comment out if you want to keep them)
REM del Workshop-4-Report.aux
REM del Workshop-4-Report.log
REM del Workshop-4-Report.toc
REM del Workshop-4-Report.lof
REM del Workshop-4-Report.lot
REM del Workshop-4-Report.out

pause



