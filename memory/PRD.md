# Brainyx - Product Requirements Document

## Original Problem Statement
Build a modern, full-stack web application named "Brainyx" (formerly "Organic Intelligence") with:
- AI chat interface powered by Claude Sonnet 4.5
- User authentication and profile management
- API key system for programmatic access
- Credit-based payment system with Stripe integration
- Professional API documentation

## Core Features

### 1. Authentication System
- JWT-based authentication
- User registration with 1000 free credits
- Login/logout functionality
- Protected routes

### 2. AI Chat Interface
- Claude Sonnet 4.5 integration via Emergent LLM Key
- Conversation history persistence
- Customizable system prompts
- Credit consumption per message

### 3. API Key Management
- Create/delete API keys
- API keys with `byx_` prefix
- Usage tracking
- Secure key hashing

### 4. Payment System (Stripe)
- **Plan Promoción**: $250 USD - 50,000 credits
- **Plan Estándar**: $400 USD - 100,000 credits
- **Plan Premium**: $500 USD - 200,000 credits
- Stripe Checkout integration
- Webhook handling for payment confirmation
- Payment status polling

### 5. Public API
- `/api/v1/chat` endpoint for programmatic AI access
- X-API-Key authentication
- Credit validation and deduction
- Usage logging

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: Firebase Realtime Database
- **AI**: Claude Sonnet 4.5 via emergentintegrations
- **Payments**: Stripe via emergentintegrations
- **Auth**: JWT tokens

## What's Been Implemented (January 2026)

### Completed Features
- [x] Full authentication system (register, login, logout)
- [x] User profile management (name, profile image)
- [x] API key CRUD operations
- [x] AI chat with Claude Sonnet 4.5
- [x] Credit system with free starter credits (1000)
- [x] Stripe payment integration
- [x] Payment status polling
- [x] Multi-section API documentation page
- [x] Dark/light theme toggle
- [x] Responsive design

### API Endpoints
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/plans` | GET | No | List available plans |
| `/api/auth/register` | POST | No | User registration |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/me` | GET | JWT | Get current user |
| `/api/users/profile` | PUT | JWT | Update profile |
| `/api/api-keys` | GET/POST | JWT | List/Create API keys |
| `/api/api-keys/{id}` | DELETE | JWT | Delete API key |
| `/api/usage` | GET | JWT | Get credits/plan info |
| `/api/stripe/create-checkout-session` | POST | JWT | Create Stripe checkout |
| `/api/stripe/checkout-status/{id}` | GET | JWT | Check payment status |
| `/api/webhook/stripe` | POST | No | Stripe webhook handler |
| `/api/v1/chat` | POST | API-Key | Public AI chat endpoint |

## Data Models (Firebase)

### Users
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password_hash": "string",
  "profile_image": "base64?",
  "credits": 1000,
  "plan": "free|promocion|estandar|premium",
  "system_prompt": "string",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

### API Keys
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "key_hash": "bcrypt hash",
  "key_preview": "byx_xxxx...xxxx",
  "is_active": true,
  "created_at": "ISO timestamp",
  "last_used": "ISO timestamp?"
}
```

### Payment Transactions
```json
{
  "id": "uuid",
  "session_id": "stripe session id",
  "user_id": "uuid",
  "plan_id": "string",
  "amount": 250.0,
  "currency": "usd",
  "credits": 50000,
  "payment_status": "pending|completed|expired",
  "created_at": "ISO timestamp"
}
```

## Pending Issues

### P0 - Critical
- [ ] Login/Registration may fail on deployed Render environment (needs verification)

### P2 - Low Priority
- [ ] Documentation page theme may not match application theme

## Future Tasks / Backlog
- [ ] Add more payment options (crypto via Stripe)
- [ ] Implement subscription model
- [ ] Add usage analytics dashboard
- [ ] Refactor server.py into modules (auth.py, chat.py, payments.py)
- [ ] Add rate limiting
- [ ] Email verification on registration
- [ ] Password reset functionality

## Test Reports
- `/app/test_reports/iteration_2.json` - Latest test results (100% pass rate)
- `/app/backend/tests/test_brainyx_api.py` - Pytest test suite

## Environment Variables

### Backend (.env)
- `FIREBASE_DB_URL` - Firebase Realtime Database URL
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_ALGORITHM` - JWT algorithm (HS256)
- `JWT_EXPIRATION_HOURS` - Token expiration (24)
- `EMERGENT_LLM_KEY` - Emergent universal key for Claude
- `STRIPE_API_KEY` - Stripe API key (test mode)
- `CORS_ORIGINS` - Allowed origins

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL
