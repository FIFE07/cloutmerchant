@echo off
REM ============================================================
REM  CLOUTMERCHANT - double-click this file to see the website.
REM  A black window will appear: that IS the website engine.
REM  Leave it open while you browse. Close it to shut the site off.
REM  (It also cleans up stale temporary files before starting,
REM   so the site always boots fresh.)
REM ============================================================
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

if exist ".next" (
  echo Cleaning stale temporary files...
  rd /s /q ".next" >nul 2>&1
)

echo Starting CLOUTMERCHANT... first start takes about 15-30 seconds.
echo.

REM Open the browser automatically once the server has had time to boot
start "" /min cmd /c "timeout /t 20 /nobreak >nul & start http://localhost:7100/"

npm run dev -- --port 7100
pause
