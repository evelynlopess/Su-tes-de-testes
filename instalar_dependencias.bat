@echo off
title Instalador TestMaster Pro
cls

echo ==================================================
echo   VERIFICANDO REQUISITOS DO SISTEMA
echo ==================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js NAO esta instalado.
    echo.
    echo Vou abrir o site oficial para voce baixar a versao LTS.
    echo Apos instalar, REINICIE o computador e abra este arquivo novamente.
    echo.
    pause
    start https://nodejs.org/
    exit
)

echo [OK] Node.js detectado. Instalando dependencias...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [!] Erro na instalacao. Verifique sua internet.
) else (
    echo.
    echo ==================================================
    echo   PRONTO! Agora use o 'iniciar_projeto.bat'
    echo ==================================================
)
pause