@echo off
title Iniciar TestMaster Pro
cls

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado. 
    echo Por favor, execute o arquivo 'instalar_dependencias.bat' primeiro.
    pause
    exit
)

echo Iniciando o TestMaster Pro...
echo Local: http://localhost:3000
echo.

call npm run dev
pause