@echo off
echo ========================================
echo   Time Academy - Starting Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Server will run at: http://localhost:3000
echo Admin panel: http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause

