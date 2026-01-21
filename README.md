# 🌿 Organic Intelligence - Aplicación Web con IA

Una aplicación web moderna con Inteligencia Artificial integrada usando Claude Sonnet 4.5.

![Organic Intelligence](https://images.unsplash.com/photo-1759157273068-42e6d441f772?w=800)

## ✨ Características

- **🤖 Chat con IA** - Conversaciones inteligentes con Claude Sonnet 4.5
- **👤 Sistema de Usuarios** - Registro, login, logout y edición de perfil
- **🔒 Seguridad** - JWT tokens, contraseñas encriptadas, emails enmascarados
- **⚙️ Personalizable** - Edita el prompt del sistema de la IA
- **🌙 Modo Oscuro** - Tema claro/oscuro
- **📱 Responsive** - Funciona en móviles y desktop
- **🇪🇸 En Español** - Interfaz completamente en español

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework Python para APIs
- **MongoDB** - Base de datos NoSQL
- **JWT** - Autenticación segura
- **Emergent Integrations** - Integración con Claude Sonnet 4.5

### Frontend
- **React 19** - Biblioteca de UI
- **Tailwind CSS** - Estilos
- **Shadcn/UI** - Componentes
- **Framer Motion** - Animaciones

## 📁 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py          # API principal
│   ├── requirements.txt   # Dependencias Python
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── App.js        # Componente principal
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # Landing, Login, Register, Chat, Profile, Settings
│   │   └── components/   # Componentes UI
│   ├── package.json      # Dependencias Node
│   └── .env             # Variables de entorno frontend
└── README.md
```

## 🚀 Instalación

### Requisitos Previos
- Python 3.9+
- Node.js 18+
- MongoDB (local o Atlas)
- API Key de Emergent LLM (o tu propia API key de Anthropic)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/organic-intelligence.git
cd organic-intelligence
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
yarn install  # o npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con la URL de tu backend
```

### 4. Ejecutar el proyecto

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start  # o npm start
```

Abre http://localhost:3000 en tu navegador.

## ⚙️ Variables de Entorno

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="organic_intelligence"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="tu-clave-secreta-muy-segura"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_HOURS=24
EMERGENT_LLM_KEY=tu-api-key-aqui
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🔑 Obtener API Key

### Opción 1: Emergent LLM Key (Recomendado)
1. Regístrate en [Emergent](https://emergent.sh)
2. Ve a Profile → Universal Key
3. Copia tu key y pégala en `EMERGENT_LLM_KEY`

### Opción 2: API Key de Anthropic
1. Ve a [Anthropic Console](https://console.anthropic.com)
2. Crea una API key
3. Modifica `server.py` para usar directamente la API de Anthropic

## 📖 Uso

1. **Registrarse** - Crea una cuenta nueva
2. **Iniciar Sesión** - Accede con tu email y contraseña
3. **Chat** - Conversa con la IA
4. **Perfil** - Edita tu nombre (el email aparece enmascarado por seguridad)
5. **Configuración** - Personaliza el prompt del sistema de la IA

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Emails enmascarados (d****@gmail.com)
- ✅ Validación de formularios
- ✅ CORS configurado
- ✅ Variables de entorno para credenciales

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Obtener usuario actual |
| PUT | /api/users/profile | Actualizar perfil |
| GET | /api/settings | Obtener configuración |
| PUT | /api/settings | Actualizar prompt del sistema |
| GET | /api/chat/conversations | Listar conversaciones |
| POST | /api/chat/conversations | Crear conversación |
| POST | /api/chat/conversations/:id/messages | Enviar mensaje |
| DELETE | /api/chat/conversations/:id | Eliminar conversación |

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto.

## 👨‍💻 Autor

Creado con ❤️ usando [Emergent](https://emergent.sh)

---

**¿Preguntas?** Abre un issue en el repositorio.
