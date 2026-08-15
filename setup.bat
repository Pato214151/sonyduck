@echo off
chcp 65001 > nul
title SonYDuck - Setup

echo.
echo ╔══════════════════════════════════════════════╗
echo ║         SonYDuck - First Time Setup          ║
echo ║         (Uses SQLite, no Docker needed)      ║
echo ╚══════════════════════════════════════════════╝
echo.

echo [1/6] Installing root dependencies...
call npm install
if errorlevel 1 goto :error

echo.
echo [2/6] Installing backend dependencies...
call npm install -w backend
if errorlevel 1 goto :error

echo.
echo [3/6] Installing frontend dependencies...
call npm install -w frontend
if errorlevel 1 goto :error

echo.
echo [4/6] Creating .env file...
if not exist "backend\.env" (
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
    echo [OK] .env file created
)

echo.
echo [5/6] Generating Prisma client...
cd backend
call npx prisma generate
if errorlevel 1 goto :error

echo.
echo [6/6] Setting up database...
call npx prisma db push
if errorlevel 1 goto :error
call npm run db:seed
cd ..

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Setup complete!                            ║
echo ║                                              ║
echo ║   Run 'start.bat' to launch the app          ║
echo ║                                              ║
echo ║   Demo credentials:                          ║
echo ║   Email:    demo@sonyduck.com                ║
echo ║   Password: Demo1234                         ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] Setup failed. Check the messages above.
pause
exit /b 1