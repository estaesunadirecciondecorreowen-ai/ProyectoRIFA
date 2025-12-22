#!/bin/bash
echo "================================================================"
echo "         SISTEMA DE RIFA ALTRUISTA - Version Simple"
echo "================================================================"
echo ""
echo "Instalando dependencias..."
python3 -m pip install -r requirements.txt
echo ""
echo "================================================================"
echo "Iniciando servidor..."
echo "================================================================"
echo ""
python3 app.py

