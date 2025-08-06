#!/usr/bin/env python3
"""
Script to seed geographic data for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from datetime import datetime

def seed_geographic_data():
    db = SessionLocal()
    try:
        print("Seeding geographic data...")
        
        # Create a sample map
        sample_map = models.Map(
            title="Paris City Tour",
            description="A comprehensive tour of Paris landmarks",
            city="Paris",
            country="France",
            difficulty_level="easy",
            estimated_duration=240,  # 4 hours
            category="cultural",
            map_type="digital",  # Required field
            price_type="free",   # Required field
            creator_type="individual",  # Required field
            created_at=datetime.utcnow()
        )
        db.add(sample_map)
        db.commit()
        db.refresh(sample_map)
        
        # Create sample map points in Paris
        paris_points = [
            {
                "name": "Eiffel Tower",
                "description": "Iconic iron lattice tower on the Champ de Mars",
                "point_type": "landmark",
                "latitude": 48.8584,
                "longitude": 2.2945,
                "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
                "city": "Paris",
                "country": "France",
                "place_id": "eiffel_tower_paris",
                "opening_hours": "9:00 AM - 12:00 AM",
                "priority": 1,
                "instagram_worthy": True,
                "is_verified": True,
                "created_by": "system"
            },
            {
                "name": "Louvre Museum",
                "description": "World's largest art museum and historic monument",
                "point_type": "museum",
                "latitude": 48.8606,
                "longitude": 2.3376,
                "address": "Rue de Rivoli, 75001 Paris, France",
                "city": "Paris",
                "country": "France",
                "place_id": "louvre_museum_paris",
                "opening_hours": "9:00 AM - 6:00 PM",
                "priority": 2,
                "instagram_worthy": True,
                "is_verified": True,
                "created_by": "system"
            },
            {
                "name": "Notre-Dame Cathedral",
                "description": "Medieval Catholic cathedral on the Île de la Cité",
                "point_type": "landmark",
                "latitude": 48.8530,
                "longitude": 2.3499,
                "address": "6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France",
                "city": "Paris",
                "country": "France",
                "place_id": "notre_dame_paris",
                "opening_hours": "8:00 AM - 6:45 PM",
                "priority": 3,
                "instagram_worthy": True,
                "is_verified": True,
                "created_by": "system"
            }
        ]
        
        for point_data in paris_points:
            point_detail = models.MapPoint(
                **point_data,
                created_at=datetime.utcnow()
            )
            db.add(point_detail)
            db.commit()
            db.refresh(point_detail)
            
            # Link point to map using the association table
            sample_map.points.append(point_detail)
        
        # Create sample points in London for testing
        london_map = models.Map(
            title="London Historic Tour",
            description="Explore historic landmarks in London",
            city="London",
            country="United Kingdom",
            difficulty_level="easy",
            estimated_duration=300,  # 5 hours
            category="cultural",
            map_type="digital",  # Required field
            price_type="free",   # Required field
            creator_type="individual",  # Required field
            created_at=datetime.utcnow()
        )
        db.add(london_map)
        db.commit()
        db.refresh(london_map)
        
        london_points = [
            {
                "name": "Big Ben",
                "description": "Famous clock tower at the Palace of Westminster",
                "point_type": "landmark",
                "latitude": 51.5007,
                "longitude": -0.1246,
                "address": "Westminster, London SW1A 0AA, UK",
                "city": "London",
                "country": "United Kingdom",
                "place_id": "big_ben_london",
                "opening_hours": "Tours available",
                "priority": 1,
                "instagram_worthy": True,
                "is_verified": True,
                "created_by": "system"
            },
            {
                "name": "Tower Bridge",
                "description": "Combined bascule and suspension bridge",
                "point_type": "landmark",
                "latitude": 51.5055,
                "longitude": -0.0754,
                "address": "Tower Bridge Rd, London SE1 2UP, UK",
                "city": "London",
                "country": "United Kingdom",
                "place_id": "tower_bridge_london",
                "opening_hours": "10:00 AM - 5:30 PM",
                "priority": 2,
                "instagram_worthy": True,
                "is_verified": True,
                "created_by": "system"
            }
        ]
        
        for point_data in london_points:
            point_detail = models.MapPoint(
                **point_data,
                created_at=datetime.utcnow()
            )
            db.add(point_detail)
            db.commit()
            db.refresh(point_detail)
            
            # Link point to map using the association table
            london_map.points.append(point_detail)
        
        db.commit()
        print("Successfully seeded geographic data!")
        print(f"Created {len(paris_points)} points for Paris")
        print(f"Created {len(london_points)} points for London")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_geographic_data()
