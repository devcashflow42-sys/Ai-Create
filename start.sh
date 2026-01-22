#!/bin/bash

echo "🌿 Iniciando Organic Intelligence..."
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no está instalado"
    exit 1
fi

# Verificar Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Python y Node.js detectados"
echo ""

# Iniciar Backend
echo "🚀 Iniciando Backend (Puerto 8001)..."
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!
cd ..

sleep 3

# Iniciar Frontend
echo "🚀 Iniciando Frontend (Puerto 3000)..."
cd frontend
yarn start &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "✅ Organic Intelligence está corriendo!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8001"
echo "📚 API Docs: http://localhost:8001/docs"
echo "=========================================="
echo ""
echo "Presiona Ctrl+C para detener"

# Esperar
wait
