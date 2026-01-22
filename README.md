# 🌿 Organic Intelligence

## 🚀 Despliegue Rápido en Render.com (GRATIS)

### Paso 1: Sube tu código a GitHub
1. Crea un repositorio en GitHub
2. Sube todos los archivos

### Paso 2: Crea cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub

### Paso 3: Crear Base de Datos MongoDB
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com) (gratis)
2. Crea un cluster gratuito
3. Copia la URL de conexión

### Paso 4: Desplegar Backend
1. En Render, clic "New" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** organic-backend
   - **Root Directory:** backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt && pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Variables de entorno:
   ```
   MONGO_URL = tu-url-de-mongodb-atlas
   DB_NAME = organic_intelligence
   JWT_SECRET = clave-secreta-muy-segura
   EMERGENT_LLM_KEY = sk-emergent-fA4A5AdFf2d520a826
   CORS_ORIGINS = *
   ```
5. Clic "Create Web Service"
6. **Copia la URL del backend** (ej: https://organic-backend.onrender.com)

### Paso 5: Desplegar Frontend
1. En Render, clic "New" → "Static Site"
2. Conecta el mismo repositorio
3. Configuración:
   - **Name:** organic-frontend
   - **Root Directory:** frontend
   - **Build Command:** `yarn install && yarn build`
   - **Publish Directory:** build
4. Variables de entorno:
   ```
   REACT_APP_BACKEND_URL = https://organic-backend.onrender.com
   ```
   (usa la URL de tu backend del paso anterior)
5. Clic "Create Static Site"

### Paso 6: Configurar Dominio Propio
1. En tu Static Site de Render
2. Ve a "Settings" → "Custom Domains"
3. Agrega tu dominio
4. Configura DNS en tu proveedor de dominio:
   - Tipo: CNAME
   - Nombre: www (o @)
   - Valor: tu-sitio.onrender.com

---

## 📁 Estructura del Proyecto

```
organic-intelligence/
├── backend/
│   ├── server.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── render.yaml
```

---

## 🔑 Obtener API Keys

### MongoDB Atlas (Gratis)
1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea cuenta gratuita
3. Crea un cluster M0 (gratis)
4. En "Database Access" crea un usuario
5. En "Network Access" permite 0.0.0.0/0
6. En "Connect" copia la connection string

### Emergent LLM Key
Ya incluida: `sk-emergent-fA4A5AdFf2d520a826`

---

## ❓ Problemas Comunes

### Página en blanco
- Verifica que REACT_APP_BACKEND_URL apunte a tu backend
- Revisa los logs en Render

### Error de CORS
- Asegúrate que CORS_ORIGINS incluya la URL de tu frontend

### Error de MongoDB
- Verifica la URL de conexión
- Asegúrate de permitir acceso desde cualquier IP (0.0.0.0/0)
