@echo off
chcp 65001 >nul
cls
echo ================================================================
echo         🎫 SISTEMA DE RIFA ALTRUISTA - Versión Simple
echo ================================================================
echo.
echo Verificando Python...
python --version
if errorlevel 1 (
    echo ❌ ERROR: Python no está instalado
    echo Descárgalo desde: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python instalado correctamente
echo.
echo ================================================================
echo Instalando/Verificando dependencias...
echo ================================================================
python -m pip install --quiet --upgrade pip
python -m pip install --quiet Flask==3.0.0 Werkzeug==3.0.1
if errorlevel 1 (
    echo ❌ ERROR al instalar dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.
echo ================================================================
echo 🚀 INICIANDO SERVIDOR...
echo ================================================================
echo.
echo ✅ Servidor corriendo en: http://localhost:5000
echo.
echo 👤 Usuario Admin:
echo    Email: admin@rifa.com
echo    Contraseña: admin123
echo.
echo ⚠️  NO CIERRES ESTA VENTANA mientras uses la aplicación
echo.
echo Presiona Ctrl+C para detener el servidor
echo ================================================================
echo.
python app.py
pause

