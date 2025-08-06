#!/usr/bin/env python3
"""
Test script to verify that our map data is properly structured for Leaflet integration
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from sqlalchemy.orm import joinedload
import json

def test_leaflet_data_structure():
    """Test that our data structure works well with Leaflet"""
    db = SessionLocal()
    
    try:
        print("=== Testing Leaflet Data Structure ===\n")
        
        # Get a map with points and routes
        map_obj = db.query(models.Map).options(
            joinedload(models.Map.points),
            joinedload(models.Map.routes)
        ).filter(models.Map.id == 1).first()
        
        if not map_obj:
            print("❌ No map found with ID 1")
            return
        
        print(f"📍 Map: {map_obj.title}")
        print(f"📍 City: {map_obj.city}, {map_obj.country}")
        print(f"📍 Points: {len(map_obj.points)}")
        print(f"📍 Routes: {len(map_obj.routes)}\n")
        
        # Test Points Data Structure
        print("=== Points for Leaflet ===")
        for i, point in enumerate(map_obj.points, 1):
            print(f"{i}. {point.name}")
            print(f"   📍 Coordinates: [{point.latitude}, {point.longitude}]")
            print(f"   📍 Type: {point.point_type}")
            print(f"   📍 Icon: {point.icon_type}")
            print(f"   📍 Priority: {point.priority}")
            print(f"   📍 Instagram Worthy: {point.instagram_worthy}")
            if point.address:
                print(f"   📍 Address: {point.address}")
            if point.opening_hours:
                print(f"   📍 Hours: {point.opening_hours}")
            print()
        
        # Test Routes Data Structure
        print("=== Routes for Leaflet ===")
        for i, route in enumerate(map_obj.routes, 1):
            print(f"{i}. {route.name}")
            print(f"   🛣️  Type: {route.route_type}")
            print(f"   🛣️  Color: {route.color_code}")
            print(f"   🛣️  Distance: {route.distance_km}km")
            print(f"   🛣️  Time: {route.estimated_time}")
            print(f"   🛣️  Difficulty: {route.difficulty}")
            
            if route.route_coordinates:
                try:
                    coords = json.loads(route.route_coordinates)
                    print(f"   🛣️  Coordinates: {len(coords)} points")
                    for j, coord in enumerate(coords):
                        print(f"      Point {j+1}: [{coord['lat']}, {coord['lng']}]")
                except Exception as e:
                    print(f"   ❌ Invalid coordinates: {e}")
            print()
        
        # Generate Leaflet-ready data structure
        print("=== Leaflet-Ready Data Structure ===")
        leaflet_data = {
            "map": {
                "id": map_obj.id,
                "title": map_obj.title,
                "city": map_obj.city,
                "country": map_obj.country,
            },
            "center": {
                "lat": sum(p.latitude for p in map_obj.points) / len(map_obj.points) if map_obj.points else 35.6762,
                "lng": sum(p.longitude for p in map_obj.points) / len(map_obj.points) if map_obj.points else 139.6503
            },
            "points": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "type": p.point_type,
                    "icon": p.icon_type,
                    "coordinates": [p.latitude, p.longitude],
                    "priority": p.priority,
                    "instagram_worthy": p.instagram_worthy,
                    "address": p.address,
                    "opening_hours": p.opening_hours,
                    "contact_info": p.contact_info,
                    "ar_content_url": p.ar_content_url
                }
                for p in map_obj.points
            ],
            "routes": []
        }
        
        # Process routes
        for route in map_obj.routes:
            route_data = {
                "id": route.id,
                "name": route.name,
                "description": route.description,
                "type": route.route_type,
                "color": route.color_code,
                "distance_km": route.distance_km,
                "estimated_time": route.estimated_time,
                "difficulty": route.difficulty,
                "highlights": route.highlights,
                "tips": route.tips,
                "is_loop": route.is_loop,
                "coordinates": []
            }
            
            if route.route_coordinates:
                try:
                    coords = json.loads(route.route_coordinates)
                    route_data["coordinates"] = [[c["lat"], c["lng"]] for c in coords]
                except Exception as e:
                    print(f"❌ Error parsing route coordinates: {e}")
            
            leaflet_data["routes"].append(route_data)
        
        print(json.dumps(leaflet_data, indent=2))
        
        print("\n✅ Data structure is ready for Leaflet!")
        print(f"✅ Center point: [{leaflet_data['center']['lat']:.4f}, {leaflet_data['center']['lng']:.4f}]")
        print(f"✅ {len(leaflet_data['points'])} points ready for markers")
        print(f"✅ {len(leaflet_data['routes'])} routes ready for polylines")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_leaflet_data_structure()
