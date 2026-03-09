@echo off
echo ========================================
echo   Veloura Hotel - Full Stack Startup
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo Admin: Open admin.html in browser
echo.

start "Veloura Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Veloura Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Close this window when done.
pause
