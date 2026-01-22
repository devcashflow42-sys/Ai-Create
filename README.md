# 🌿 Organic Intelligence

Aplicación web con Inteligencia Artificial integrada.

## 🚀 Inicio Rápido

### Paso 1: Instalar dependencias

**Backend (Python):**
```bash
cd backend
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

**Frontend (Node.js):**
```bash
cd frontend
yarn install
```

### Paso 2: Configurar variables de entorno

**Backend** - Crea el archivo `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=organic_intelligence
JWT_SECRET=tu-clave-secreta-segura-aqui
EMERGENT_LLM_KEY=tu-api-key-aqui
CORS_ORIGINS=http://localhost:3000
```

**Frontend** - Crea el archivo `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Paso 3: Iniciar la aplicación

**Opción A - Script automático:**
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

**Opción B - Manual:**

Terminal 1 (Backend):
```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
yarn start
```

### Paso 4: Abrir en navegador

- **Aplicación:** http://localhost:3000
- **API Docs:** http://localhost:8001/docs

---

## 📁 Estructura del Proyecto

```
organic-intelligence/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dependencias Python
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── App.js        # Componente principal
│   │   ├── pages/        # Páginas (Login, Chat, etc.)
│   │   └── context/      # Contextos (Auth, Theme)
│   ├── package.json
│   └── .env
├── start.sh              # Script inicio Linux/Mac
├── start.bat             # Script inicio Windows
└── README.md
```

---

## 🔑 Obtener API Key

1. Regístrate en [Emergent](https://emergent.sh)
2. Ve a **Profile → Universal Key**
3. Copia la key y pégala en `backend/.env`

---

## 🌐 Desplegar en Producción

### Opción 1: Railway (Recomendado - Gratis)

1. Crea cuenta en [Railway](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Agrega las variables de entorno
4. Railway desplegará automáticamente

### Opción 2: Render

1. Crea cuenta en [Render](https://render.com)
2. Crea un "Web Service" para el backend
3. Crea un "Static Site" para el frontend
4. Configura las variables de entorno

### Opción 3: VPS (DigitalOcean, Linode, etc.)

```bash
# En tu servidor
git clone tu-repositorio
cd organic-intelligence
./start.sh
```

---

## ❓ Problemas Comunes

### La página aparece en blanco
- Verifica que el backend esté corriendo en puerto 8001
- Verifica que `REACT_APP_BACKEND_URL` apunte al backend correcto
- Revisa la consola del navegador (F12) para ver errores

### Error de conexión a MongoDB
- Instala MongoDB localmente o usa MongoDB Atlas (gratis)
- Verifica la URL en `MONGO_URL`

### Error de CORS
- Asegúrate que `CORS_ORIGINS` incluya la URL de tu frontend

---

## 📞 Soporte

¿Problemas? Abre un issue en el repositorio.
