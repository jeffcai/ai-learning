#!/usr/bin/env python3
"""
Test script to verify map creation with point association works correctly.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_map_creation_with_points():
    """Test creating a map and associating points with it"""
    
    # Step 1: Create a test map
    map_data = {
        "title": "Test Map with Points",
        "description": "Testing point association",
        "city": "Paris",
        "country": "France",
        "category": "cultural",
        "map_type": "hand_drawn",
        "price_type": "free",
        "price": 0,
        "creator_name": "Test User"
    }
    
    print("Creating test map...")
    response = requests.post(f"{BASE_URL}/maps/", json=map_data)
    if response.status_code != 201:
        print(f"Error creating map: {response.status_code} - {response.text}")
        return
    
    created_map = response.json()
    map_id = created_map["id"]
    print(f"Created map with ID: {map_id}")
    
    # Step 2: Create test points
    points_data = [
        {
            "name": "Test Point 1",
            "description": "First test point",
            "point_type": "landmark",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "city": "Paris",
            "country": "France",
            "created_by": "Test User"
        },
        {
            "name": "Test Point 2", 
            "description": "Second test point",
            "point_type": "cafe",
            "latitude": 48.8584,
            "longitude": 2.2945,
            "city": "Paris",
            "country": "France", 
            "created_by": "Test User"
        }
    ]
    
    point_ids = []
    print("Creating test points...")
    for point_data in points_data:
        response = requests.post(f"{BASE_URL}/maps/points/", json=point_data)
        if response.status_code != 201:
            print(f"Error creating point: {response.status_code} - {response.text}")
            continue
        
        created_point = response.json()
        point_ids.append(created_point["id"])
        print(f"Created point with ID: {created_point['id']} - {created_point['name']}")
    
    # Step 3: Associate points with the map
    if point_ids:
        print(f"Associating {len(point_ids)} points with map...")
        association_data = {"point_ids": point_ids}
        response = requests.post(f"{BASE_URL}/maps/{map_id}/points/associate", json=association_data)
        if response.status_code != 200:
            print(f"Error associating points: {response.status_code} - {response.text}")
        else:
            result = response.json()
            print(f"Successfully associated points: {result}")
    
    # Step 4: Verify the map now has the points
    print("Verifying map has associated points...")
    response = requests.get(f"{BASE_URL}/maps/{map_id}")
    if response.status_code != 200:
        print(f"Error fetching map: {response.status_code} - {response.text}")
        return
    
    map_with_points = response.json()
    print(f"Map now has {len(map_with_points.get('points', []))} points associated:")
    for point in map_with_points.get('points', []):
        print(f"  - {point['name']} ({point['point_type']})")
    
    print(f"\nTest completed! Map ID: {map_id}")
    print(f"You can view it at: http://localhost:3000/maps/{map_id}")

if __name__ == "__main__":
    test_map_creation_with_points()
