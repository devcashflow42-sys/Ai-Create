# 🌿 Organic Intelligence

## 🚀 Despliegue en Render.com (GRATIS)

### Comando de Build para Frontend:
```
rm -f package-lock.json && yarn install --production=false && yarn build
```

### Variables de Entorno Necesarias:

**Backend:**
```
MONGO_URL = tu-url-de-mongodb
DB_NAME = organic_intelligence  
JWT_SECRET = clave-secreta-segura
EMERGENT_LLM_KEY = sk-emergent-fA4A5AdFf2d520a826
CORS_ORIGINS = *
```

**Frontend:**
```
REACT_APP_BACKEND_URL = https://tu-backend.onrender.com
CI = false
```

---

## Pasos de Despliegue:

### 1. MongoDB Atlas (Gratis)
1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea cluster M0 gratuito
3. Copia la URL de conexión

### 2. Backend en Render
1. New → Web Service
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt && pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`
4. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 3. Frontend en Render  
1. New → Static Site
2. Root Directory: `frontend`
3. Build Command: `rm -f package-lock.json && yarn install --production=false && yarn build`
4. Publish Directory: `build`

### 4. Dominio Personalizado
1. Settings → Custom Domains
2. Agrega tu dominio
3. Configura CNAME en tu proveedor DNS
