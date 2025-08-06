#!/usr/bin/env python3
import requests
import json
import time

def test_maps_api():
    """Test the maps API endpoints"""
    base_url = "http://localhost:8000/api/v1"
    
    print("=== Testing Maps API ===")
    
    try:
        # Test 1: Get maps list
        print("\n1. Testing GET /maps/")
        response = requests.get(f"{base_url}/maps/")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Maps list retrieved successfully")
            print(f"  Total maps: {data['total']}")
            print(f"  Retrieved: {len(data['maps'])}")
            
            if data['maps']:
                first_map = data['maps'][0]
                map_id = first_map['id']
                print(f"  First map: {first_map['title']} (ID: {map_id})")
                
                # Test 2: Get map details
                print(f"\n2. Testing GET /maps/{map_id}")
                detail_response = requests.get(f"{base_url}/maps/{map_id}")
                print(f"Status: {detail_response.status_code}")
                
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    print(f"✓ Map details retrieved successfully")
                    print(f"  Title: {detail_data['title']}")
                    print(f"  Points: {len(detail_data['points'])}")
                    print(f"  Routes: {len(detail_data['routes'])}")
                    print(f"  Reviews: {len(detail_data['reviews'])}")
                    print(f"  Rating: {detail_data['rating']}")
                    print(f"  Download count: {detail_data['download_count']}")
                    
                    # Pretty print a subset of the response
                    print(f"\n--- Sample Response ---")
                    sample = {
                        "id": detail_data["id"],
                        "title": detail_data["title"],
                        "city": detail_data["city"],
                        "rating": detail_data["rating"],
                        "points_count": len(detail_data["points"]),
                        "routes_count": len(detail_data["routes"]),
                        "reviews_count": len(detail_data["reviews"])
                    }
                    print(json.dumps(sample, indent=2))
                    
                else:
                    print(f"✗ Error getting map details: {detail_response.text}")
            else:
                print("✗ No maps found in the response")
        else:
            print(f"✗ Error getting maps list: {response.text}")
            
        # Test 3: Test a non-existent map
        print(f"\n3. Testing GET /maps/999 (non-existent)")
        not_found_response = requests.get(f"{base_url}/maps/999")
        print(f"Status: {not_found_response.status_code}")
        if not_found_response.status_code == 404:
            print("✓ Correctly returns 404 for non-existent map")
        else:
            print(f"✗ Unexpected response: {not_found_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    test_maps_api()
