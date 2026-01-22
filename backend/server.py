from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
try:
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[os.environ.get('DB_NAME', 'organic_intelligence')]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Organic Intelligence API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    role: str  # "user" or "assistant"
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

class FeedbackCreate(BaseModel):
    message_id: str
    feedback_type: str  # "positive" or "negative"
    correction: Optional[str] = None

# ============ HELPER FUNCTIONS ============

def mask_email(email: str) -> str:
    """Mask email: d****@gmail.com"""
    parts = email.split('@')
    if len(parts) != 2:
        return email
    local = parts[0]
    domain = parts[1]
    if len(local) <= 1:
        return f"{local[0]}****@{domain}"
    return f"{local[0]}{'*' * 4}@{domain}"

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return user

def format_user_response(user: dict) -> UserResponse:
    """Format user data for response"""
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        masked_email=mask_email(user["email"]),
        created_at=user["created_at"],
        system_prompt=user.get("system_prompt")
    )

DEFAULT_SYSTEM_PROMPT = """Eres un asistente de inteligencia artificial amigable y útil llamado "Organic Intelligence". 
Tu objetivo es ayudar a los usuarios de manera clara, concisa y empática.
Responde siempre en español a menos que el usuario te hable en otro idioma.
Sé profesional pero accesible, y siempre trata de dar respuestas útiles y bien estructuradas."""

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if email exists
        existing = await db.users.find_one({"email": user_data.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
        
        # Create user
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        user_doc = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email.lower(),
            "password_hash": hash_password(user_data.password),
            "system_prompt": DEFAULT_SYSTEM_PROMPT,
            "created_at": now,
            "updated_at": now
        }
        
        await db.users.insert_one(user_doc)
        
        # Create token
        token = create_token(user_id)
        
        return TokenResponse(
            access_token=token,
            user=format_user_response(user_doc)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in register: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        user = await db.users.find_one({"email": credentials.email.lower()}, {"_id": 0})
        
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        token = create_token(user["id"])
        
        return TokenResponse(
            access_token=token,
            user=format_user_response(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
    return TokenResponse(
        access_token=token,
        user=format_user_response(user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return format_user_response(current_user)

# ============ USER ROUTES ============

@api_router.put("/users/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_fields = {}
    
    if update_data.name:
        update_fields["name"] = update_data.name
    
    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_fields}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    return format_user_response(updated_user)

# ============ SETTINGS ROUTES ============

@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get user settings (system prompt)"""
    return SettingsResponse(
        system_prompt=current_user.get("system_prompt", DEFAULT_SYSTEM_PROMPT)
    )

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(settings: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    """Update user settings (system prompt)"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {
            "system_prompt": settings.system_prompt,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return SettingsResponse(system_prompt=settings.system_prompt)

# ============ CHAT ROUTES ============

@api_router.get("/chat/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for current user"""
    conversations = await db.conversations.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    
    return conversations

@api_router.post("/chat/conversations", response_model=ConversationResponse)
async def create_conversation(current_user: dict = Depends(get_current_user)):
    """Create a new conversation"""
    conversation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    conversation = {
        "id": conversation_id,
        "user_id": current_user["id"],
        "messages": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.conversations.insert_one(conversation)
    
    return ConversationResponse(**conversation)

@api_router.get("/chat/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific conversation"""
    conversation = await db.conversations.find_one(
        {"id": conversation_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    return ConversationResponse(**conversation)

@api_router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a conversation"""
    result = await db.conversations.delete_one(
        {"id": conversation_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    return {"message": "Conversación eliminada"}

@api_router.post("/chat/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message and get AI response"""
    # Get conversation
    conversation = await db.conversations.find_one(
        {"id": conversation_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    # Create user message
    user_msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_message = {
        "id": user_msg_id,
        "role": "user",
        "content": message.content,
        "timestamp": now
    }
    
    # Add user message to conversation
    await db.conversations.update_one(
        {"id": conversation_id},
        {
            "$push": {"messages": user_message},
            "$set": {"updated_at": now}
        }
    )
    
    # Get AI response
    try:
        system_prompt = current_user.get("system_prompt", DEFAULT_SYSTEM_PROMPT)
        
        # Create chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"conv-{conversation_id}-{current_user['id']}",
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Build conversation history for context
        for msg in conversation.get("messages", [])[-10:]:  # Last 10 messages for context
            if msg["role"] == "user":
                await chat.send_message(UserMessage(text=msg["content"]))
        
        # Send current message
        ai_response = await chat.send_message(UserMessage(text=message.content))
        
    except Exception as e:
        logger.error(f"Error getting AI response: {e}")
        ai_response = "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."
    
    # Create AI message
    ai_msg_id = str(uuid.uuid4())
    ai_timestamp = datetime.now(timezone.utc).isoformat()
    
    ai_message = {
        "id": ai_msg_id,
        "role": "assistant",
        "content": ai_response,
        "timestamp": ai_timestamp
    }
    
    # Add AI message to conversation
    await db.conversations.update_one(
        {"id": conversation_id},
        {
            "$push": {"messages": ai_message},
            "$set": {"updated_at": ai_timestamp}
        }
    )
    
    # Save interaction for learning/fine-tuning
    await db.interactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "conversation_id": conversation_id,
        "user_message": message.content,
        "ai_response": ai_response,
        "system_prompt": current_user.get("system_prompt", DEFAULT_SYSTEM_PROMPT),
        "timestamp": ai_timestamp
    })
    
    return MessageResponse(**ai_message)

@api_router.post("/chat/feedback")
async def submit_feedback(feedback: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    """Submit feedback for AI learning"""
    feedback_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "message_id": feedback.message_id,
        "feedback_type": feedback.feedback_type,
        "correction": feedback.correction,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.feedback.insert_one(feedback_doc)
    
    return {"message": "Gracias por tu retroalimentación"}

# ============ STATUS ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Organic Intelligence API", "status": "online"}

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
