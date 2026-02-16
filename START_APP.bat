@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Job Portal Application Startup
echo ========================================
echo.

REM Kill any existing processes on ports
echo Checking and freeing up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5003') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5004') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5005') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5006') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5007') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F 2>nul

echo Ports cleared!
echo.

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker detected! Starting with Docker Compose...
    echo.
    docker-compose -f docker-compose.yml up --build
) else (
    echo Docker not found. Installing dependencies and starting services...
    echo.
    echo Installing all dependencies...
    call npm run install:all
    echo.
    echo NOTE: MongoDB must be running locally on port 27017
    echo.
    echo To start MongoDB:
    echo   Option 1: If MongoDB is installed locally
    echo     - Windows: Use MongoDB Compass or run mongod.exe
    echo   Option 2: Use MongoDB Atlas (Cloud)
    echo     - Update MONGO_URI in .env file with your Atlas connection string
    echo.
    echo Starting application...
    call npm run dev
)

endlocal
pause
