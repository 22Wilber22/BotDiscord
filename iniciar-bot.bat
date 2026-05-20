@echo off
title MusicBot Discord
color 0A
echo ========================================
echo        INICIANDO MUSIC BOT
echo ========================================
echo.
cd /d "%~dp0"
node index.js
echo.
echo Bot detenido. Presiona una tecla para cerrar...
pause >nul
