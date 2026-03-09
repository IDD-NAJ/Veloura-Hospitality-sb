@echo off
echo ========================================
echo   Veloura Integration Test Suite
echo ========================================
echo.

echo Testing Backend API Endpoints...
echo.

echo [Test 1/5] Health Check
curl -s http://localhost:3000/api/health
echo.
echo.

echo [Test 2/5] Hotels List
curl -s http://localhost:3000/api/hotels | findstr "success"
echo.
echo.

echo [Test 3/5] API Root
curl -s http://localhost:3000/api | findstr "Veloura"
echo.
echo.

echo [Test 4/5] Database Connection
curl -s http://localhost:3000/api/health | findstr "healthy"
echo.
echo.

echo [Test 5/5] CORS Headers
curl -I http://localhost:3000/api/health | findstr "Access-Control"
echo.
echo.

echo ========================================
echo   Test Suite Complete
echo ========================================
echo.
echo If all tests show data, integration is working!
echo.
pause
