@echo off
echo ==========================================================
echo Starting Full-Stack Social Media Platform (Pulse)
echo ==========================================================
start "Pulse Backend (Java Spring Boot)" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "Pulse Frontend (React + Vite)" cmd /k "%~dp0start-frontend.bat"
echo.
echo Platform is launching!
echo Backend will be available at:  http://localhost:8080
echo Frontend will be available at: http://localhost:5173
echo.
pause
