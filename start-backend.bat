@echo off
echo ========================================
echo   Veloura Hotel Backend Server
echo ========================================
echo.

cd backend

echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)
echo.

echo [2/3] Setting up database...
call npm run db:setup
echo.

echo [3/3] Starting server...
echo Backend will run on http://localhost:3000
echo API available at http://localhost:3000/api
echo.
call npm run dev
