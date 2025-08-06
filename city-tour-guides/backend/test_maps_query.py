#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models, schemas
from sqlalchemy.orm import joinedload
import json

def test_maps_endpoint():
    """Test the maps endpoint logic directly"""
    db = SessionLocal()
    
    try:
        print("=== Testing Maps Query ===")
        
        # Replicate the exact query from the endpoint
        query = db.query(models.Map).options(
            joinedload(models.Map.points),
            joinedload(models.Map.routes)
        ).filter(models.Map.is_active == True)
        
        # Get total count
        total = query.count()
        print(f"Total active maps: {total}")
        
        # Get first 12 maps
        maps = query.order_by(
            models.Map.is_featured.desc(),
            models.Map.rating.desc(),
            models.Map.created_at.desc()
        ).limit(12).all()
        
        print(f"Retrieved maps: {len(maps)}")
        
        # Test Pydantic serialization
        map_list = []
        for map_obj in maps:
            try:
                # Convert to Pydantic model
                map_data = schemas.MapResponse.model_validate(map_obj)
                map_dict = map_data.model_dump()
                map_list.append(map_dict)
                print(f"✓ Map '{map_obj.title}' serialized successfully")
            except Exception as e:
                print(f"✗ Error serializing map '{map_obj.title}': {e}")
        
        # Create response
        response_data = {
            "maps": map_list,
            "total": total,
            "page": 1,
            "per_page": 12,
            "total_pages": 1
        }
        
        print("\n=== Final Response ===")
        print(json.dumps(response_data, indent=2, default=str))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_maps_endpoint()
