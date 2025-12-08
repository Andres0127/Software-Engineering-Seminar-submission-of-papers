@echo off
echo ========================================
echo Updating Events Database
echo ========================================
echo.

REM Try Docker first
docker ps --filter "name=postgres" --format "{{.Names}}" >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Docker container found, executing script in container...
    docker exec -i eventplatform-postgres psql -U postgres -d eventplatform -f /docker-entrypoint-initdb.d/03-update-future-events-complete.sql
    if %ERRORLEVEL% == 0 (
        echo Script executed successfully via Docker!
        goto verify
    )
)

REM Try local PostgreSQL on port 5433 (Docker port)
echo Trying local PostgreSQL on port 5433...
psql -U postgres -d eventplatform -h localhost -p 5433 -f python-backend\scripts\03-update-future-events-complete.sql
if %ERRORLEVEL% == 0 (
    echo Script executed successfully on port 5433!
    goto verify
)

REM Try local PostgreSQL on default port 5432
echo Trying local PostgreSQL on default port 5432...
psql -U postgres -d eventplatform -h localhost -p 5432 -f python-backend\scripts\03-update-future-events-complete.sql
if %ERRORLEVEL% == 0 (
    echo Script executed successfully on port 5432!
    goto verify
)

echo.
echo ERROR: Could not connect to PostgreSQL database.
echo Please make sure:
echo   1. Docker containers are running, OR
echo   2. PostgreSQL is installed and running locally
echo.
pause
exit /b 1

:verify
echo.
echo ========================================
echo Verifying database update...
echo ========================================
echo.

REM Verify events count
docker exec -i eventplatform-postgres psql -U postgres -d eventplatform -c "SELECT COUNT(*) as total_events FROM events;" 2>nul || psql -U postgres -d eventplatform -h localhost -p 5433 -c "SELECT COUNT(*) as total_events FROM events;" 2>nul || psql -U postgres -d eventplatform -h localhost -p 5432 -c "SELECT COUNT(*) as total_events FROM events;" 2>nul

echo.
echo ========================================
echo Database update completed!
echo ========================================
pause



