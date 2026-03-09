@echo off
echo ========================================
echo   Veloura Hotel Frontend
echo ========================================
echo.

echo [1/2] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)
echo.

echo [2/2] Starting development server...
echo Frontend will run on http://localhost:5173
echo.
call npm run dev
