#!/usr/bin/env python3
"""
Database migration script to add content column to articles table
"""
import sqlite3
import os
import sys

# Add parent directory to path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database import db

def migrate_database():
    """Add content column to articles table"""
    app = create_app()
    
    with app.app_context():
        # Get database path
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        
        print(f"Migrating database at: {db_path}")
        
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if content column already exists
            cursor.execute("PRAGMA table_info(articles)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'content' not in columns:
                print("Adding content column to articles table...")
                
                # Add content column
                cursor.execute("ALTER TABLE articles ADD COLUMN content TEXT")
                
                # Copy url content to content column for existing articles
                cursor.execute("UPDATE articles SET content = url WHERE content IS NULL")
                
                # Make content NOT NULL
                # Note: SQLite doesn't support modifying column constraints directly,
                # but we'll handle this in the model validation
                
                conn.commit()
                print("✅ Content column added successfully!")
            else:
                print("ℹ️  Content column already exists.")
            
            # Check if url column can be nullable (we can't modify this in SQLite easily)
            print("ℹ️  URL column will be treated as optional in application logic.")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            conn.rollback()
            return False
        finally:
            conn.close()
        
        return True

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("🎉 Database migration completed successfully!")
    else:
        print("💥 Database migration failed!")
        sys.exit(1)
