#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/Users/jcai7/projects/ai/ai-learning/reader-digest/backend')

from app import create_app

def test_tags_handling():
    """Test that the frontend will receive tags as arrays"""
    app = create_app()
    
    with app.app_context():
        client = app.test_client()
        
        # Test getting articles
        response = client.get('/api/v1/articles')
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.get_json()
            articles = data.get('articles', [])
            
            print(f"Found {len(articles)} articles")
            
            for article in articles:
                print(f"Article: {article['title']}")
                print(f"Tags type: {type(article.get('tags'))}")
                print(f"Tags value: {article.get('tags')}")
                print("---")
        else:
            print(f"Error: {response.get_data(as_text=True)}")

if __name__ == "__main__":
    test_tags_handling()
