@echo off
set PORT=3000
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%PORT% " ^| findstr /R /C:"LISTENING"') do (
  echo Stopping PID %%p on port %PORT%
  taskkill /PID %%p /F
)