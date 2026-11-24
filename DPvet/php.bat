@echo off
setlocal
set "PORTA=%~1"
if "%PORTA%"=="" set "PORTA=8000"
cd /d "%~dp0"
php -S localhost:%PORTA% -t public
pause
