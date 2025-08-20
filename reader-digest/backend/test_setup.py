#!/usr/bin/env python3
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, '/Users/jcai7/projects/ai/ai-learning/reader-digest/backend')

try:
    print("Testing imports...")
    from database import db, jwt, login_manager
    print("✅ Database imports successful")
    
    from models.models import User, Article, Digest
    print("✅ Model imports successful")
    
    from app import create_app
    print("✅ App import successful")
    
    print("Creating Flask app...")
    app = create_app()
    print("✅ Flask app created successfully")
    
    with app.app_context():
        print("Testing database connection...")
        # Try to create tables
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Try to query (this will test if SQLAlchemy is properly initialized)
        users = User.query.all()
        print(f"✅ Database query successful - found {len(users)} users")
    
    print("\n🎉 All tests passed! SQLAlchemy issue is resolved.")
    
    # Start the server
    print("Starting Flask server...")
    app.run(debug=True, port=5001, host='0.0.0.0')
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
