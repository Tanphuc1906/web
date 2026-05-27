@echo off
color 0A
echo =========================================
echo      KHOI DONG HE THONG SD'BIKE
echo =========================================
echo.
echo [INFO] Dang kiem tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Khong tim thay Node.js. Vui long cai dat Node.js truoc!
    pause
    exit
)

echo [INFO] Dang khoi dong Server Backend...
start /B node server/server.js

echo [INFO] Vui long cho 2 giay de Server san sang...
timeout /t 2 /nobreak >nul

echo [INFO] Mo trinh duyet...
start http://localhost:3000

echo.
echo =========================================
echo Server dang chay! Nhan phim bat ky de tat server khi khong dung nua.
echo =========================================
pause
taskkill /F /IM node.exe >nul 2>&1
