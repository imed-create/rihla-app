@echo off
echo ========================================
echo  RIHLA - Starting with FRESH cache
echo ========================================
echo.
cd /d "C:\Users\dell\Desktop\NEW APP\airbnb clone\airbnb-clone-react-native"
echo Killing old Metro server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
  taskkill /F /PID %%a 2>nul
)
echo.
echo Clearing cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
echo.
echo Starting Expo with --clear flag...
echo Wait 20 seconds then scan the QR code
echo.
start "Metro" cmd /k "npx expo start --clear"
echo.
echo Done! A new window opened with Metro.
echo Wait 20 seconds then scan the QR code.
pause
