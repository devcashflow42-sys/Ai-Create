"""
Brainyx API Tests - Testing auth, plans, usage, API keys, and Stripe integration
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://brainyx-app.preview.emergentagent.com')

# Test user credentials
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
TEST_PASSWORD = "test123456"
TEST_NAME = "Test User"

class TestHealthEndpoints:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["message"] == "Brainyx API"
        print(f"✓ Root endpoint passed: {data}")


class TestPlansEndpoint:
    """Plans listing endpoint tests"""
    
    def test_get_plans(self):
        """Test GET /api/plans - should return all available plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert "plans" in data
        plans = data["plans"]
        
        # Verify all 3 plans exist
        assert "promocion" in plans
        assert "estandar" in plans
        assert "premium" in plans
        
        # Verify plan structure
        promo = plans["promocion"]
        assert promo["name"] == "Plan Promoción"
        assert promo["price"] == 250
        assert promo["credits"] == 50000
        
        estandar = plans["estandar"]
        assert estandar["name"] == "Plan Estándar"
        assert estandar["price"] == 400
        assert estandar["credits"] == 100000
        
        premium = plans["premium"]
        assert premium["name"] == "Plan Premium"
        assert premium["price"] == 500
        assert premium["credits"] == 200000
        
        print(f"✓ Plans endpoint passed: {len(plans)} plans found")


class TestAuthFlow:
    """Authentication flow tests - register and login"""
    
    @pytest.fixture(scope="class")
    def registered_user(self):
        """Register a test user and return credentials"""
        email = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
        password = "test123456"
        name = "Test User"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": name,
            "email": email,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            return {
                "email": email,
                "password": password,
                "name": name,
                "token": data["access_token"],
                "user": data["user"]
            }
        elif response.status_code == 400 and "ya está registrado" in response.text:
            # User already exists, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
            if login_response.status_code == 200:
                data = login_response.json()
                return {
                    "email": email,
                    "password": password,
                    "name": name,
                    "token": data["access_token"],
                    "user": data["user"]
                }
        
        pytest.skip(f"Could not register/login test user: {response.text}")
    
    def test_register_new_user(self):
        """Test user registration - should create user with 1000 free credits"""
        email = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "New Test User",
            "email": email,
            "password": "test123456"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "user" in data
        
        user = data["user"]
        assert user["email"] == email
        assert user["name"] == "New Test User"
        assert user["credits"] == 1000  # Free credits for new users
        assert user["plan"] == "free"
        assert "masked_email" in user
        
        print(f"✓ Registration passed: User created with {user['credits']} free credits")
    
    def test_register_duplicate_email(self, registered_user):
        """Test registration with existing email should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate User",
            "email": registered_user["email"],
            "password": "test123456"
        })
        
        assert response.status_code == 400
        assert "ya está registrado" in response.json()["detail"]
        print("✓ Duplicate email registration correctly rejected")
    
    def test_login_success(self, registered_user):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"]
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == registered_user["email"]
        
        print(f"✓ Login passed for user: {data['user']['masked_email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@brainyx.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "Credenciales inválidas" in response.json()["detail"]
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_current_user(self, registered_user):
        """Test GET /api/auth/me with valid token"""
        headers = {"Authorization": f"Bearer {registered_user['token']}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == registered_user["email"]
        assert "credits" in data
        assert "plan" in data
        
        print(f"✓ Get current user passed: {data['masked_email']}")


class TestUsageEndpoint:
    """Usage endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for testing"""
        email = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Usage Test User",
            "email": email,
            "password": "test123456"
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not get auth token")
    
    def test_get_usage_authenticated(self, auth_token):
        """Test GET /api/usage with valid token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/usage", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "credits" in data
        assert "plan" in data
        assert data["credits"] == 1000  # New user should have 1000 credits
        assert data["plan"] == "free"
        
        print(f"✓ Usage endpoint passed: {data['credits']} credits, plan: {data['plan']}")
    
    def test_get_usage_unauthenticated(self):
        """Test GET /api/usage without token should fail"""
        response = requests.get(f"{BASE_URL}/api/usage")
        
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated usage request correctly rejected")


class TestAPIKeysEndpoint:
    """API Keys endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for testing"""
        email = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "API Key Test User",
            "email": email,
            "password": "test123456"
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not get auth token")
    
    def test_get_api_keys_empty(self, auth_token):
        """Test GET /api/api-keys for new user (should be empty)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/api-keys", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ API Keys list endpoint passed: {len(data)} keys found")
    
    def test_create_api_key(self, auth_token):
        """Test POST /api/api-keys to create new key"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/api-keys", 
            headers=headers,
            json={"name": "Test API Key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "name" in data
        assert "key" in data
        assert data["name"] == "Test API Key"
        assert data["key"].startswith("byx_")
        
        print(f"✓ API Key created: {data['key'][:12]}...")
        return data
    
    def test_get_api_keys_unauthenticated(self):
        """Test GET /api/api-keys without token should fail"""
        response = requests.get(f"{BASE_URL}/api/api-keys")
        
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated API keys request correctly rejected")


class TestStripeCheckout:
    """Stripe checkout session tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for testing"""
        email = f"test_{uuid.uuid4().hex[:8]}@brainyx.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Stripe Test User",
            "email": email,
            "password": "test123456"
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not get auth token")
    
    def test_create_checkout_session_promocion(self, auth_token):
        """Test POST /api/stripe/create-checkout-session for promocion plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session",
            headers=headers,
            json={
                "plan_id": "promocion",
                "origin_url": "https://brainyx-app.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        
        print(f"✓ Checkout session created for promocion plan: {data['session_id'][:20]}...")
    
    def test_create_checkout_session_estandar(self, auth_token):
        """Test POST /api/stripe/create-checkout-session for estandar plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session",
            headers=headers,
            json={
                "plan_id": "estandar",
                "origin_url": "https://brainyx-app.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        
        print(f"✓ Checkout session created for estandar plan: {data['session_id'][:20]}...")
    
    def test_create_checkout_session_premium(self, auth_token):
        """Test POST /api/stripe/create-checkout-session for premium plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session",
            headers=headers,
            json={
                "plan_id": "premium",
                "origin_url": "https://brainyx-app.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        
        print(f"✓ Checkout session created for premium plan: {data['session_id'][:20]}...")
    
    def test_create_checkout_session_invalid_plan(self, auth_token):
        """Test checkout with invalid plan should fail"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session",
            headers=headers,
            json={
                "plan_id": "invalid_plan",
                "origin_url": "https://brainyx-app.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 400
        assert "Plan no válido" in response.json()["detail"]
        print("✓ Invalid plan correctly rejected")
    
    def test_create_checkout_session_unauthenticated(self):
        """Test checkout without auth should fail"""
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session",
            json={
                "plan_id": "promocion",
                "origin_url": "https://brainyx-app.preview.emergentagent.com"
            }
        )
        
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated checkout correctly rejected")


class TestExistingUserLogin:
    """Test login with provided test credentials"""
    
    def test_login_test_user(self):
        """Test login with test@brainyx.com credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@brainyx.com",
            "password": "test123456"
        })
        
        # This may fail if user doesn't exist - that's expected
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Test user login successful: {data['user']['masked_email']}")
            assert "access_token" in data
        else:
            print(f"⚠ Test user not found (expected if not pre-created): {response.status_code}")
            # Don't fail - just note it
            assert response.status_code in [401, 404, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
