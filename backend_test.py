#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Organic Intelligence App
Tests all endpoints including auth, chat, settings, and user management
"""

import requests
import sys
import json
from datetime import datetime
import time

class OrganicIntelligenceAPITester:
    def __init__(self, base_url="https://ai-web-assistant-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.conversation_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
                if success:
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                else:
                    print(f"   Error Response: {response_data}")
            except:
                if not success:
                    print(f"   Raw Response: {response.text[:200]}...")

            self.log_test(name, success, 
                         f"Expected {expected_status}, got {response.status_code}" if not success else "",
                         response_data)
            
            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   ❌ Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200, auth_required=False)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200, auth_required=False)

    def test_user_registration(self):
        """Test user registration"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        # Generate unique test user
        timestamp = int(time.time())
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user,
            auth_required=False
        )
        
        if success and response:
            self.token = response.get('access_token')
            if response.get('user'):
                self.user_id = response['user'].get('id')
            print(f"   ✅ Token obtained: {self.token[:20]}...")
            print(f"   ✅ User ID: {self.user_id}")
        
        return success

    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        # Try to login with demo credentials
        login_data = {
            "email": "demo@example.com",
            "password": "demo123"
        }
        
        success, response = self.run_test(
            "User Login (Demo)",
            "POST",
            "auth/login",
            200,
            data=login_data,
            auth_required=False
        )
        
        # If demo login fails, that's expected - we'll use registration token
        if not success:
            print("   ℹ️  Demo login failed (expected) - using registration token")
        
        return True  # Don't fail the test suite for this

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n" + "="*50)
        print("TESTING AUTH ME ENDPOINT")
        print("="*50)
        
        if not self.token:
            print("   ⚠️  No token available, skipping auth/me test")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and response:
            print(f"   ✅ User name: {response.get('name')}")
            print(f"   ✅ Masked email: {response.get('masked_email')}")
        
        return success

    def test_profile_update(self):
        """Test profile update"""
        print("\n" + "="*50)
        print("TESTING PROFILE UPDATE")
        print("="*50)
        
        if not self.token:
            print("   ⚠️  No token available, skipping profile update test")
            return False
        
        update_data = {
            "name": "Updated Test User"
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "users/profile",
            200,
            data=update_data
        )
        
        return success

    def test_settings_endpoints(self):
        """Test settings endpoints"""
        print("\n" + "="*50)
        print("TESTING SETTINGS ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("   ⚠️  No token available, skipping settings tests")
            return False
        
        # Get settings
        success1, response = self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200
        )
        
        # Update settings
        new_prompt = "Eres un asistente de prueba. Responde siempre de manera amigable y en español."
        
        success2, response = self.run_test(
            "Update Settings",
            "PUT",
            "settings",
            200,
            data={"system_prompt": new_prompt}
        )
        
        return success1 and success2

    def test_chat_endpoints(self):
        """Test chat functionality"""
        print("\n" + "="*50)
        print("TESTING CHAT ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("   ⚠️  No token available, skipping chat tests")
            return False
        
        # Get conversations (should be empty initially)
        success1, response = self.run_test(
            "Get Conversations",
            "GET",
            "chat/conversations",
            200
        )
        
        # Create new conversation
        success2, response = self.run_test(
            "Create Conversation",
            "POST",
            "chat/conversations",
            200
        )
        
        if success2 and response:
            self.conversation_id = response.get('id')
            print(f"   ✅ Conversation ID: {self.conversation_id}")
        
        # Get specific conversation
        if self.conversation_id:
            success3, response = self.run_test(
                "Get Specific Conversation",
                "GET",
                f"chat/conversations/{self.conversation_id}",
                200
            )
        else:
            success3 = False
            self.log_test("Get Specific Conversation", False, "No conversation ID available")
        
        # Send message and get AI response
        if self.conversation_id:
            message_data = {"content": "Hola, ¿cómo estás?"}
            print("   🤖 Sending message to AI (this may take a few seconds)...")
            
            success4, response = self.run_test(
                "Send Message to AI",
                "POST",
                f"chat/conversations/{self.conversation_id}/messages",
                200,
                data=message_data
            )
            
            if success4 and response:
                print(f"   ✅ AI Response: {response.get('content', '')[:100]}...")
        else:
            success4 = False
            self.log_test("Send Message to AI", False, "No conversation ID available")
        
        # Delete conversation
        if self.conversation_id:
            success5, response = self.run_test(
                "Delete Conversation",
                "DELETE",
                f"chat/conversations/{self.conversation_id}",
                200
            )
        else:
            success5 = False
            self.log_test("Delete Conversation", False, "No conversation ID available")
        
        return success1 and success2 and success3 and success4 and success5

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Organic Intelligence API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test sequence
        self.test_health_endpoints()
        
        # Registration is required for other tests
        if self.test_user_registration():
            self.test_auth_me()
            self.test_profile_update()
            self.test_settings_endpoints()
            self.test_chat_endpoints()
        else:
            print("\n❌ Registration failed - skipping authenticated tests")
        
        # Try login test (non-critical)
        self.test_user_login()
        
        # Print final results
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    """Main test execution"""
    tester = OrganicIntelligenceAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())