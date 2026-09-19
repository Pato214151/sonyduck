@echo off
REM Arranque con un clic en Windows: instala lo que falte, crea el .env si no
REM existe y levanta backend (3001) y frontend (5173).
chcp 65001 > nul
title SonYDuck - One-Click Start

echo.
echo ╔══════════════════════════════════════════════╗
echo ║         SonYDuck - Spotify Clone             ║
echo ║         One-Click Startup                    ║
echo ╚══════════════════════════════════════════════╝
echo.

:: Check if node_modules exists in root
if not exist "node_modules" (
    echo [1/5] Installing root dependencies...
    call npm install
    if errorlevel 1 goto :error
)

:: Create .env if missing (SQLite, no Docker needed)
if not exist "backend\.env" (
    echo [2/5] Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=3001
        echo FRONTEND_URL=http://localhost:5173
        echo DATABASE_URL=file:./dev.db
        echo JWT_SECRET=dev-secret-change-in-production-min-32-chars-long-please
        echo JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars
        echo JWT_EXPIRES_IN=15m
        echo JWT_REFRESH_EXPIRES_IN=7d
    ) > backend\.env
)

:: Install backend deps if needed
if not exist "backend\node_modules" (
    echo [3/5] Installing backend dependencies...
    call npm install -w backend
    if errorlevel 1 goto :error
)

:: Install frontend deps if needed
if not exist "frontend\node_modules" (
    echo [4/5] Installing frontend dependencies...
    call npm install -w frontend
    if errorlevel 1 goto :error
)

:: Setup database if needed
if not exist "backend\prisma\dev.db" (
    echo [5/5] Setting up database...
    cd backend
    call npx prisma generate
    call npx prisma db push
    call npm run db:seed
    cd ..
) else (
    echo [5/5] Database already exists, skipping setup
)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Starting SonYDuck backend + frontend...    ║
echo ║                                              ║
echo ║   Backend:  http://localhost:3001/api         ║
echo ║   Frontend: http://localhost:5173             ║
echo ║                                              ║
echo ║   Demo credentials:                          ║
echo ║   Email:    demo@sonyduck.com                ║
echo ║   Password: Demo1234                         ║
echo ║                                              ║
echo ║   Press Ctrl+C to stop                       ║
echo ╚══════════════════════════════════════════════╝
echo.

call npm run dev

goto :eof

:error
echo.
echo [ERROR] Setup failed. Check the messages above.
pause
exit /b 1