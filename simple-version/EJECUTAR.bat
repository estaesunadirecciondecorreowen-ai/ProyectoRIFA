@echo off
echo ================================================================
echo         SISTEMA DE RIFA ALTRUISTA - Version Simple
echo ================================================================
echo.
echo Instalando dependencias...
python -m pip install -r requirements.txt
echo.
echo ================================================================
echo Iniciando servidor...
echo ================================================================
echo.
python app.py
pause

