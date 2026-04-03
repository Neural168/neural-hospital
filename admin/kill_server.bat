@echo off
color 0c
echo ==============================================
echo   Force Closing Old Background Servers
echo ==============================================

echo Killing process on Port 5000 (Back-End)...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr "0.0.0.0:5000" ') DO (
  taskkill /F /PID %%T
)

echo Killing process on Port 5173 (Front-End)...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr "0.0.0.0:5173" ') DO (
  taskkill /F /PID %%T
)

echo.
echo ==============================================
echo  [SUCCESS] All old servers are closed! 
echo  You can now double-click 'admin.bat' again.
echo ==============================================
timeout /t 5
