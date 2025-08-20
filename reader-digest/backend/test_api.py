#!/usr/bin/env python3
import requests
import json

# Test the API endpoints to debug the 422 error
BASE_URL = "http://localhost:5001/api/v1"

def test_register():
    """Test user registration"""
    url = f"{BASE_URL}/auth/register"
    data = {
        "username": "testuser",
        "email": "test@example.com", 
        "password": "Password123!"
    }
    
    print("Testing user registration...")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        result = response.json()
        return result.get('access_token')
    return None

def test_login():
    """Test user login"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "login": "testuser",
        "password": "Password123!"
    }
    
    print("\nTesting user login...")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        return result.get('access_token')
    return None
    
def test_create_article(token):
    """Test article creation with JWT token"""
    url = f"{BASE_URL}/articles"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Test Article",
        "content": "This is test content for the article",
        "url": "https://example.com/test-article",
        "notes": "Test notes",
        "tags": ["test", "debugging"],
        "is_public": False
    }
    
    print("\nTesting article creation...")
    print(f"Token: {token[:50]}...")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    return response.status_code == 201

if __name__ == "__main__":
    # Try to register, if user exists try to login
    token = test_register()
    if not token:
        token = test_login()
    
    if token:
        print(f"\nGot JWT token: {token[:50]}...")
        test_create_article(token)
    else:
        print("Failed to get JWT token")
