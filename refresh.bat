@echo off
cd /d "C:\Users\dell\Desktop\NEW APP\airbnb clone\airbnb-clone-react-native"
echo Killing existing Metro...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a 2>nul
echo Clearing cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
echo Starting Expo with fresh cache...
start "Metro" cmd /c "npx expo start --clear"
echo Done! Wait 15 seconds then scan the QR code.
pause
