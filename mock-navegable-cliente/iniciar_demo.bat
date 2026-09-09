@echo off
title Piano Colombia - Mock Navegable Demo Cliente (Puerto 3001)
color 0B
echo =======================================================
echo    PIANO COLOMBIA - MOCK NAVEGABLE PARA CLIENTE
echo                (PUERTO 3001)
echo =======================================================
echo.
echo Verificando dependencias...
if not exist node_modules (
    echo [INFO] Instalando dependencias necesarias para el Mock...
    call npm install
)

echo.
echo [INFO] Iniciando servidor de demostracion en http://localhost:3001 ...
echo [INFO] Abre tu navegador en: http://localhost:3001
echo.
call npm run dev
pause
