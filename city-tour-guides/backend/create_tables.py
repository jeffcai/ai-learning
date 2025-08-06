#!/usr/bin/env python3
"""
Script to create all database tables
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app import models

def create_tables():
    try:
        print("Dropping existing tables...")
        models.Base.metadata.drop_all(bind=engine)
        print("Creating database tables...")
        models.Base.metadata.create_all(bind=engine)
        print("Successfully created all tables!")
        
        # List tables created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables created: {', '.join(tables)}")
        
        # Show columns for map_points_detail to verify schema
        print("\nmap_points_detail table schema:")
        columns = inspector.get_columns('map_points_detail')
        for col in columns:
            print(f"  {col['name']} ({col['type']})")
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise

if __name__ == "__main__":
    create_tables()
