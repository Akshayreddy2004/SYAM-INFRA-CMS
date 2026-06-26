@echo off
echo.
echo ========================================================
echo           SYAM INFRA CMS - HARD RESET TOOL
echo ========================================================
echo.
echo WARNING: This will delete ALL clients, projects, payments,
echo expenses, and uploaded files. The system will be wiped clean!
echo.
set /p choice="Are you sure you want to do a HARD RESET? (Y/N): "
if /I "%choice%" NEQ "Y" goto end

echo.
echo Performing hard reset...
cd backend
venv\Scripts\python.exe clear_db.py
cd ..

echo.
echo Reset complete! You can now use the app normally.
pause
exit

:end
echo.
echo Reset cancelled. No data was deleted.
pause
