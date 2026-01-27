@echo off
echo ========================================
echo  Crowd Flow Commander - Starting Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting development server...
echo.
echo Server will be available at: http://localhost:5173
echo (If port 8080 is busy, Vite will use 5173 automatically)
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause

