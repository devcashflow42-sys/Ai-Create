@echo off
echo 🌿 Iniciando Organic Intelligence...
echo.

:: Iniciar Backend
echo 🚀 Iniciando Backend (Puerto 8001)...
start "Backend" cmd /c "cd backend && python -m uvicorn server:app --host 0.0.0.0 --port 8001"

timeout /t 3 /nobreak > nul

:: Iniciar Frontend
echo 🚀 Iniciando Frontend (Puerto 3000)...
start "Frontend" cmd /c "cd frontend && yarn start"

echo.
echo ==========================================
echo ✅ Organic Intelligence está corriendo!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8001
echo 📚 API Docs: http://localhost:8001/docs
echo ==========================================
echo.
pause
