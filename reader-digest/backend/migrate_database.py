#!/usr/bin/env python3
"""
Database migration script to create tables with updated schema
"""

import os
import sys

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import create_app
from database import db

def migrate_database():
    """Create or update database tables"""
    app = create_app()
    
    with app.app_context():
        try:
            # Drop all tables and recreate them (for development only)
            print("Dropping existing tables...")
            db.drop_all()
            
            print("Creating new tables...")
            db.create_all()
            
            print("Database migration completed successfully!")
            
            # Verify tables were created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Created tables: {tables}")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            return False
    
    return True

if __name__ == "__main__":
    success = migrate_database()
    sys.exit(0 if success else 1)
