@echo off
echo ========================================
echo Starting ECOMP - Customer Segmentation
echo ========================================

echo.
echo [1/2] Starting Backend (Flask)...
start "ECOMP Backend" cmd /k "cd /d %~dp0backend && python app.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (React/Vite)...
start "ECOMP Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Both servers should be running shortly:
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul