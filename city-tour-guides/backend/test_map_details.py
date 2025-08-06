#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models, schemas
from sqlalchemy.orm import joinedload
import json

def test_map_details():
    """Test the map details endpoint logic directly"""
    db = SessionLocal()
    
    try:
        print("=== Testing Map Details Query ===")
        
        # Get the first available map
        first_map = db.query(models.Map).filter(models.Map.is_active == True).first()
        if not first_map:
            print("No active maps found!")
            return
        
        map_id = first_map.id
        print(f"Testing map ID: {map_id} - '{first_map.title}'")
        
        # Replicate the exact query from the endpoint
        map_obj = db.query(models.Map).options(
            joinedload(models.Map.points),
            joinedload(models.Map.routes).joinedload(models.MapRoute.start_point),
            joinedload(models.Map.routes).joinedload(models.MapRoute.end_point),
            joinedload(models.Map.reviews)
        ).filter(
            models.Map.id == map_id,
            models.Map.is_active == True
        ).first()
        
        if not map_obj:
            print(f"✗ Map with ID {map_id} not found")
            return
        
        print(f"✓ Map found: '{map_obj.title}'")
        print(f"  - Points: {len(map_obj.points)}")
        print(f"  - Routes: {len(map_obj.routes)}")
        print(f"  - Reviews: {len(map_obj.reviews)}")
        
        # Test Pydantic serialization
        try:
            map_detail = schemas.MapDetailResponse.model_validate(map_obj)
            map_dict = map_detail.model_dump()
            print("✓ Map detail serialized successfully")
            
            # Print a summary of the response
            print(f"\n=== Map Detail Summary ===")
            print(f"Title: {map_dict['title']}")
            print(f"City: {map_dict['city']}, {map_dict['country']}")
            print(f"Category: {map_dict['category']}")
            print(f"Rating: {map_dict['rating']}")
            print(f"Points: {len(map_dict['points'])}")
            print(f"Routes: {len(map_dict['routes'])}")
            print(f"Reviews: {len(map_dict['reviews'])}")
            
            # Show points details
            if map_dict['points']:
                print(f"\n--- Points ---")
                for point in map_dict['points']:
                    print(f"  • {point['name']} ({point['point_type']})")
            
            # Show routes details
            if map_dict['routes']:
                print(f"\n--- Routes ---")
                for route in map_dict['routes']:
                    print(f"  • {route['name']} - {route['distance_km']}km ({route['estimated_time']})")
            
            # Show reviews
            if map_dict['reviews']:
                print(f"\n--- Reviews ---")
                for review in map_dict['reviews']:
                    print(f"  • {review['reviewer_name']}: {review['rating']}/5 - {review['review_text'][:50]}...")
            
            print(f"\n=== JSON Response Size ===")
            json_str = json.dumps(map_dict, default=str)
            print(f"Response size: {len(json_str)} characters")
            
        except Exception as e:
            print(f"✗ Error serializing map detail: {e}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_map_details()
