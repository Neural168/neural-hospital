@echo off
echo ==============================================
echo  Starting Hospital Accident System...
echo ==============================================

:: Start the Back-End Express Server
echo Starting Admin Back-End on Port 5000...
start "Admin Backend Server" cmd /k "cd /d %~dp0 && node server.js"

:: Give the backend 2 seconds to start
timeout /t 2 /nobreak > nul

:: Start the Front-End Vite Server
echo Starting Front-End Dashboard on Port 5173...
start "Frontend Dashboard" cmd /k "cd /d %~dp0\.. && npm run dev"

:: Give the frontend 2 seconds to start
timeout /t 2 /nobreak > nul

:: Open the browser to the Front-End automatically
echo Opening Browser...
start http://localhost:5173

exit
