from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import secrets
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase Realtime Database Config
FIREBASE_DB_URL = os.environ.get('FIREBASE_DB_URL', 'https://hypnotic-camp-479405-g2-default-rtdb.firebaseio.com')

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Brainyx API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ PLANS CONFIG ============
PLANS = {
    "promocion": {"name": "Plan Promoción", "price": 250, "credits": 50000, "description": "Ideal para empezar"},
    "estandar": {"name": "Plan Estándar", "price": 400, "credits": 100000, "description": "Para uso regular"},
    "premium": {"name": "Plan Premium", "price": 500, "credits": 200000, "description": "Uso ilimitado profesional"}
}

# ============ FIREBASE HELPER FUNCTIONS ============

async def firebase_get(path: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{FIREBASE_DB_URL}/{path}.json")
        if response.status_code == 200:
            return response.json()
        return None

async def firebase_set(path: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{FIREBASE_DB_URL}/{path}.json", json=data)
        return response.status_code == 200

async def firebase_push(path: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{FIREBASE_DB_URL}/{path}.json", json=data)
        if response.status_code == 200:
            return response.json().get('name')
        return None

async def firebase_update(path: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.patch(f"{FIREBASE_DB_URL}/{path}.json", json=data)
        return response.status_code == 200

async def firebase_delete(path: str):
    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{FIREBASE_DB_URL}/{path}.json")
        return response.status_code == 200

async def firebase_find_by_field(collection: str, field: str, value: str):
    data = await firebase_get(collection)
    if data:
        for doc_id, doc in data.items():
            if doc.get(field) == value:
                doc['_firebase_id'] = doc_id
                return doc
    return None

# ============ MODELS ============

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    masked_email: str
    created_at: str
    system_prompt: Optional[str] = None
    profile_image: Optional[str] = None
    credits: int = 0
    plan: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    profile_image: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_preview: str
    created_at: str
    last_used: Optional[str] = None
    is_active: bool = True

class APIKeyCreatedResponse(BaseModel):
    id: str
    name: str
    key: str
    message: str = "⚠️ Guarda esta llave. Solo se muestra una vez."

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    role: str
    content: str
    timestamp: str

class ConversationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    messages: List[MessageResponse]
    created_at: str
    updated_at: str

class SettingsUpdate(BaseModel):
    system_prompt: str = Field(..., min_length=10, max_length=2000)

class SettingsResponse(BaseModel):
    system_prompt: str

class PlanPurchase(BaseModel):
    plan_id: str

class BrainyxAPIRequest(BaseModel):
    message: str = Field(..., min_length=1)
    system_prompt: Optional[str] = None

# ============ HELPER FUNCTIONS ============

def mask_email(email: str) -> str:
    parts = email.split('@')
    if len(parts) != 2:
        return email
    local = parts[0]
    domain = parts[1]
    if len(local) <= 1:
        return f"{local[0]}****@{domain}"
    return f"{local[0]}{'*' * 4}@{domain}"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def generate_api_key() -> str:
    return f"byx_{secrets.token_hex(32)}"

def hash_api_key(key: str) -> str:
    return bcrypt.hashpw(key.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    user = await firebase_find_by_field("users", "id", user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

async def get_user_by_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    """Validate API Key and return user"""
    if not x_api_key or not x_api_key.startswith("byx_"):
        raise HTTPException(status_code=401, detail="API Key inválida")
    
    # Find API key in database
    api_keys = await firebase_get("api_keys")
    if not api_keys:
        raise HTTPException(status_code=401, detail="API Key no encontrada")
    
    for key_id, key_data in api_keys.items():
        if key_data.get("key_hash"):
            try:
                if bcrypt.checkpw(x_api_key.encode('utf-8'), key_data["key_hash"].encode('utf-8')):
                    if not key_data.get("is_active", True):
                        raise HTTPException(status_code=401, detail="API Key desactivada")
                    
                    # Get user
                    user = await firebase_find_by_field("users", "id", key_data["user_id"])
                    if not user:
                        raise HTTPException(status_code=401, detail="Usuario no encontrado")
                    
                    # Check credits
                    if user.get("credits", 0) <= 0:
                        raise HTTPException(status_code=402, detail="Saldo agotado. Recarga tu plan.")
                    
                    # Update last used
                    await firebase_update(f"api_keys/{key_id}", {
                        "last_used": datetime.now(timezone.utc).isoformat()
                    })
                    
                    user["_api_key_id"] = key_id
                    return user
            except Exception:
                continue
    
    raise HTTPException(status_code=401, detail="API Key no encontrada")

def format_user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        masked_email=mask_email(user["email"]),
        created_at=user["created_at"],
        system_prompt=user.get("system_prompt"),
        profile_image=user.get("profile_image"),
        credits=user.get("credits", 0),
        plan=user.get("plan")
    )

DEFAULT_SYSTEM_PROMPT = """Eres Brainyx, un asistente de inteligencia artificial avanzado y amigable.
Tu objetivo es ayudar a los usuarios de manera clara, concisa y profesional.
Responde siempre en español a menos que el usuario te hable en otro idioma."""

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    try:
        existing = await firebase_find_by_field("users", "email", user_data.email.lower())
        if existing:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
        
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        user_doc = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email.lower(),
            "password_hash": hash_password(user_data.password),
            "system_prompt": DEFAULT_SYSTEM_PROMPT,
            "credits": 1000,  # Free credits for new users
            "plan": "free",
            "created_at": now,
            "updated_at": now
        }
        
        firebase_id = await firebase_push("users", user_doc)
        if not firebase_id:
            raise HTTPException(status_code=500, detail="Error al crear usuario")
        
        token = create_token(user_id)
        return TokenResponse(access_token=token, user=format_user_response(user_doc))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in register: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        user = await firebase_find_by_field("users", "email", credentials.email.lower())
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        token = create_token(user["id"])
        return TokenResponse(access_token=token, user=format_user_response(user))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return format_user_response(current_user)

# ============ USER ROUTES ============

@api_router.put("/users/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    try:
        firebase_id = current_user.get('_firebase_id')
        if not firebase_id:
            raise HTTPException(status_code=500, detail="Error interno")
        
        update_fields = {}
        if update_data.name:
            update_fields["name"] = update_data.name
        if update_data.profile_image is not None:
            update_fields["profile_image"] = update_data.profile_image
        
        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
            await firebase_update(f"users/{firebase_id}", update_fields)
        
        updated_user = await firebase_find_by_field("users", "id", current_user["id"])
        return format_user_response(updated_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ============ API KEYS ROUTES ============

@api_router.get("/api-keys", response_model=List[APIKeyResponse])
async def get_api_keys(current_user: dict = Depends(get_current_user)):
    try:
        all_keys = await firebase_get("api_keys")
        if not all_keys:
            return []
        
        user_keys = []
        for key_id, key_data in all_keys.items():
            if key_data.get("user_id") == current_user["id"]:
                user_keys.append(APIKeyResponse(
                    id=key_id,
                    name=key_data["name"],
                    key_preview=key_data.get("key_preview", "byx_****"),
                    created_at=key_data["created_at"],
                    last_used=key_data.get("last_used"),
                    is_active=key_data.get("is_active", True)
                ))
        
        return sorted(user_keys, key=lambda x: x.created_at, reverse=True)
    except Exception as e:
        logger.error(f"Error in get_api_keys: {e}")
        return []

@api_router.post("/api-keys", response_model=APIKeyCreatedResponse)
async def create_api_key(key_data: APIKeyCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Generate new API key
        raw_key = generate_api_key()
        key_hash = hash_api_key(raw_key)
        key_preview = f"{raw_key[:8]}...{raw_key[-4:]}"
        
        key_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        key_doc = {
            "id": key_id,
            "user_id": current_user["id"],
            "name": key_data.name,
            "key_hash": key_hash,
            "key_preview": key_preview,
            "is_active": True,
            "created_at": now
        }
        
        await firebase_set(f"api_keys/{key_id}", key_doc)
        
        return APIKeyCreatedResponse(
            id=key_id,
            name=key_data.name,
            key=raw_key
        )
    except Exception as e:
        logger.error(f"Error in create_api_key: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: str, current_user: dict = Depends(get_current_user)):
    try:
        key_data = await firebase_get(f"api_keys/{key_id}")
        if not key_data or key_data.get("user_id") != current_user["id"]:
            raise HTTPException(status_code=404, detail="API Key no encontrada")
        
        await firebase_delete(f"api_keys/{key_id}")
        return {"message": "API Key eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_api_key: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ============ PLANS ROUTES ============

@api_router.get("/plans")
async def get_plans():
    return {"plans": PLANS}

@api_router.post("/plans/purchase")
async def purchase_plan(purchase: PlanPurchase, current_user: dict = Depends(get_current_user)):
    try:
        if purchase.plan_id not in PLANS:
            raise HTTPException(status_code=400, detail="Plan no válido")
        
        plan = PLANS[purchase.plan_id]
        firebase_id = current_user.get('_firebase_id')
        
        # Add credits to user
        current_credits = current_user.get("credits", 0)
        new_credits = current_credits + plan["credits"]
        
        await firebase_update(f"users/{firebase_id}", {
            "credits": new_credits,
            "plan": purchase.plan_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Log transaction
        transaction_id = str(uuid.uuid4())
        await firebase_set(f"transactions/{transaction_id}", {
            "id": transaction_id,
            "user_id": current_user["id"],
            "plan_id": purchase.plan_id,
            "amount": plan["price"],
            "credits": plan["credits"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "message": f"Plan {plan['name']} activado exitosamente",
            "credits": new_credits
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in purchase_plan: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.get("/usage")
async def get_usage(current_user: dict = Depends(get_current_user)):
    return {
        "credits": current_user.get("credits", 0),
        "plan": current_user.get("plan", "free")
    }

# ============ BRAINYX PUBLIC API ============

@api_router.post("/v1/chat")
async def brainyx_chat(request: BrainyxAPIRequest, user: dict = Depends(get_user_by_api_key)):
    """Public API endpoint for Brainyx AI - requires API Key"""
    try:
        firebase_id = user.get('_firebase_id')
        current_credits = user.get("credits", 0)
        
        # Deduct credits (1 credit per request)
        credits_to_deduct = 1
        if current_credits < credits_to_deduct:
            raise HTTPException(status_code=402, detail="Saldo agotado")
        
        # Get AI response
        system_prompt = request.system_prompt or user.get("system_prompt", DEFAULT_SYSTEM_PROMPT)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"api-{user['id']}-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await chat.send_message(UserMessage(text=request.message))
        
        # Deduct credits
        new_credits = current_credits - credits_to_deduct
        await firebase_update(f"users/{firebase_id}", {"credits": new_credits})
        
        # Log usage
        usage_id = str(uuid.uuid4())
        await firebase_set(f"api_usage/{usage_id}", {
            "user_id": user["id"],
            "credits_used": credits_to_deduct,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "response": response,
            "credits_remaining": new_credits
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in brainyx_chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ============ SETTINGS ROUTES ============

@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    return SettingsResponse(system_prompt=current_user.get("system_prompt", DEFAULT_SYSTEM_PROMPT))

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(settings: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    try:
        firebase_id = current_user.get('_firebase_id')
        await firebase_update(f"users/{firebase_id}", {
            "system_prompt": settings.system_prompt,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        return SettingsResponse(system_prompt=settings.system_prompt)
    except Exception as e:
        logger.error(f"Error in update_settings: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ============ CHAT ROUTES (Internal) ============

@api_router.get("/chat/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    try:
        all_convs = await firebase_get("conversations")
        if not all_convs:
            return []
        
        user_convs = []
        for conv_id, conv in all_convs.items():
            if conv.get("user_id") == current_user["id"]:
                conv['id'] = conv.get('id', conv_id)
                if 'messages' not in conv:
                    conv['messages'] = []
                user_convs.append(ConversationResponse(**conv))
        
        user_convs.sort(key=lambda x: x.updated_at, reverse=True)
        return user_convs[:100]
    except Exception as e:
        logger.error(f"Error in get_conversations: {e}")
        return []

@api_router.post("/chat/conversations", response_model=ConversationResponse)
async def create_conversation(current_user: dict = Depends(get_current_user)):
    try:
        conversation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        conversation = {
            "id": conversation_id,
            "user_id": current_user["id"],
            "messages": [],
            "created_at": now,
            "updated_at": now
        }
        
        await firebase_set(f"conversations/{conversation_id}", conversation)
        return ConversationResponse(**conversation)
    except Exception as e:
        logger.error(f"Error in create_conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.get("/chat/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    try:
        conversation = await firebase_get(f"conversations/{conversation_id}")
        if not conversation or conversation.get("user_id") != current_user["id"]:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
        if 'messages' not in conversation:
            conversation['messages'] = []
        return ConversationResponse(**conversation)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    try:
        conversation = await firebase_get(f"conversations/{conversation_id}")
        if not conversation or conversation.get("user_id") != current_user["id"]:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
        await firebase_delete(f"conversations/{conversation_id}")
        return {"message": "Conversación eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.post("/chat/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(conversation_id: str, message: MessageCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Check credits
        if current_user.get("credits", 0) <= 0:
            raise HTTPException(status_code=402, detail="Saldo agotado. Recarga tu plan.")
        
        conversation = await firebase_get(f"conversations/{conversation_id}")
        if not conversation or conversation.get("user_id") != current_user["id"]:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
        
        if 'messages' not in conversation:
            conversation['messages'] = []
        
        user_msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        user_message = {"id": user_msg_id, "role": "user", "content": message.content, "timestamp": now}
        conversation['messages'].append(user_message)
        
        # Get AI response
        try:
            system_prompt = current_user.get("system_prompt", DEFAULT_SYSTEM_PROMPT)
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"conv-{conversation_id}",
                system_message=system_prompt
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            for msg in conversation['messages'][-10:]:
                if msg["role"] == "user":
                    await chat.send_message(UserMessage(text=msg["content"]))
            
            ai_response = await chat.send_message(UserMessage(text=message.content))
        except Exception as e:
            logger.error(f"Error getting AI response: {e}")
            ai_response = "Lo siento, hubo un error. Intenta de nuevo."
        
        ai_msg_id = str(uuid.uuid4())
        ai_timestamp = datetime.now(timezone.utc).isoformat()
        ai_message = {"id": ai_msg_id, "role": "assistant", "content": ai_response, "timestamp": ai_timestamp}
        
        conversation['messages'].append(ai_message)
        conversation['updated_at'] = ai_timestamp
        
        await firebase_set(f"conversations/{conversation_id}", conversation)
        
        # Deduct credits
        firebase_id = current_user.get('_firebase_id')
        new_credits = current_user.get("credits", 0) - 1
        await firebase_update(f"users/{firebase_id}", {"credits": max(0, new_credits)})
        
        return MessageResponse(**ai_message)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ============ STATUS ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Brainyx API", "status": "online", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
