@echo off
chcp 65001 >nul
cd /d "%~dp0"
py -3 run_ndvm.py
if errorlevel 1 python run_ndvm.py
pause
