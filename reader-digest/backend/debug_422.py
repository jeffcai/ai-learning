#!/usr/bin/env python3
"""
Direct test to debug 422 errors without external server
"""
import sys
import os
sys.path.insert(0, '/Users/jcai7/projects/ai/ai-learning/reader-digest/backend')

from app import create_app
from database import db
from models.models import User
from flask_jwt_extended import create_access_token
import json

def test_article_creation():
    """Test article creation directly through Flask app"""
    app = create_app()
    
    with app.app_context():
        # Create a test user first
        user = User()
        user.username = "testuser"
        user.email = "test@example.com"
        user.set_password("Password123!")
        
        try:
            db.session.add(user)
            db.session.commit()
            print(f"Created user with ID: {user.id}")
        except Exception as e:
            print(f"User creation error: {e}")
            # Rollback the failed transaction first
            db.session.rollback()
            # User might already exist, try to get it
            user = User.query.filter_by(username="testuser").first()
            if user:
                print(f"Using existing user with ID: {user.id}")
            else:
                print("Failed to create or find user")
                return
        
        # Create JWT token
        token = create_access_token(identity=str(user.id))
        print(f"Created JWT token: {token[:50]}...")
        
        # Test article creation via test client
        client = app.test_client()
        
        # Test data
        article_data = {
            "title": "Test Article",
            "content": "This is test content for the article",
            "url": "https://example.com/test-article",
            "notes": "Test notes",
            "tags": ["test", "debugging"],
            "is_public": False
        }
        
        print("\nTesting article creation...")
        print(f"Article data: {json.dumps(article_data, indent=2)}")
        
        # Make the request
        response = client.post(
            '/api/v1/articles',
            json=article_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        print(f"\nResponse status: {response.status_code}")
        print(f"Response data: {response.get_data(as_text=True)}")
        
        if response.status_code == 422:
            print("\n422 ERROR DETECTED - VALIDATION FAILED")
            # Try to get more details from the response
            try:
                error_data = response.get_json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse error response as JSON")
        elif response.status_code == 201:
            print("\nSUCCESS - Article created successfully!")
        else:
            print(f"\nUnexpected status code: {response.status_code}")

if __name__ == "__main__":
    test_article_creation()
