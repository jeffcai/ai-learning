#!/usr/bin/env python3
"""
Seed script for map data - Creates sample hand-drawn maps, points, and routes
Targeting the user personas mentioned: travelers (C-end) and local businesses (B2B)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
import json

def create_sample_maps():
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(models.MapReview).delete()
        db.query(models.MapRoute).delete()
        db.query(models.map_points).delete()  # Association table
        db.query(models.MapPoint).delete()
        db.query(models.Map).delete()
        db.commit()
        
        # Create sample map points first
        points_data = [
            # Tokyo Cafe Hopping Points
            {
                "name": "Blue Bottle Coffee Shinjuku",
                "description": "Minimalist coffee shop perfect for Instagram photos",
                "point_type": "cafe",
                "latitude": 35.6938,
                "longitude": 139.7034,
                "address": "1-1-1 Shinjuku, Tokyo",
                "opening_hours": "7:00-20:00",
                "contact_info": "+81-3-1234-5678",
                "icon_type": "coffee",
                "priority": 1,
                "instagram_worthy": True,
                "ar_content_url": "https://example.com/ar/blue-bottle"
            },
            {
                "name": "Shibuya Sky Observatory",
                "description": "Panoramic city views - perfect for sunset photos",
                "point_type": "viewpoint",
                "latitude": 35.6581,
                "longitude": 139.7016,
                "address": "Shibuya Sky, Tokyo",
                "opening_hours": "9:00-23:00",
                "icon_type": "camera",
                "priority": 1,
                "instagram_worthy": True
            },
            {
                "name": "Meiji Shrine",
                "description": "Peaceful traditional shrine in the heart of Tokyo",
                "point_type": "landmark",
                "latitude": 35.6764,
                "longitude": 139.6993,
                "address": "1-1 Kamizono-cho, Shibuya",
                "opening_hours": "5:00-18:00",
                "icon_type": "temple",
                "priority": 1,
                "instagram_worthy": True
            },
            
            # Paris Art & Culture Points
            {
                "name": "Le Procope",
                "description": "Historic cafe where Voltaire used to drink coffee",
                "point_type": "cafe",
                "latitude": 48.8529,
                "longitude": 2.3390,
                "address": "13 Rue de l'Ancienne Comédie, Paris",
                "opening_hours": "11:00-24:00",
                "icon_type": "coffee",
                "priority": 1,
                "instagram_worthy": True
            },
            {
                "name": "Sainte-Chapelle",
                "description": "Gothic chapel with stunning stained glass windows",
                "point_type": "landmark",
                "latitude": 48.8553,
                "longitude": 2.3451,
                "address": "8 Boulevard du Palais, Paris",
                "opening_hours": "9:00-19:00",
                "icon_type": "church",
                "priority": 1,
                "instagram_worthy": True
            },
            {
                "name": "Seine River Bank",
                "description": "Perfect picnic spot along the historic river",
                "point_type": "viewpoint",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "address": "Quai de la Tournelle, Paris",
                "icon_type": "nature",
                "priority": 2,
                "instagram_worthy": True
            },
            
            # San Francisco Coffee Culture Points
            {
                "name": "Blue Bottle Coffee Ferry Building",
                "description": "Artisanal coffee at the historic Ferry Building",
                "point_type": "cafe",
                "latitude": 37.7955,
                "longitude": -122.3937,
                "address": "1 Ferry Building, San Francisco",
                "opening_hours": "6:30-19:00",
                "icon_type": "coffee",
                "priority": 1,
                "instagram_worthy": True
            },
            {
                "name": "Golden Gate Bridge Vista Point",
                "description": "Iconic bridge views for the perfect photo",
                "point_type": "viewpoint",
                "latitude": 37.8199,
                "longitude": -122.4783,
                "address": "Golden Gate Bridge, San Francisco",
                "icon_type": "camera",
                "priority": 1,
                "instagram_worthy": True
            }
        ]
        
        db_points = []
        for point_data in points_data:
            db_point = models.MapPoint(**point_data)
            db.add(db_point)
            db_points.append(db_point)
        
        db.flush()  # Get IDs without committing
        
        # Create sample maps
        maps_data = [
            {
                "title": "Tokyo Cafe Hopping Adventure",
                "description": "A hand-drawn guide to Tokyo's most Instagram-worthy cafes and hidden gems. Perfect for coffee lovers and social media enthusiasts aged 20-35.",
                "city": "Tokyo",
                "country": "Japan",
                "category": "cafe",
                "map_type": "hand_drawn",
                "difficulty_level": "easy",
                "estimated_duration": "Half day (4-5 hours)",
                "price_type": "premium",
                "price": 15.99,
                "map_image_url": "https://example.com/maps/tokyo-cafe-map.jpg",
                "thumbnail_url": "https://example.com/thumbs/tokyo-cafe-thumb.jpg",
                "creator_name": "Tokyo Map Studio",
                "creator_type": "business",
                "tags": "cafe,coffee,instagram,tokyo,shibuya,shinjuku,social media",
                "is_featured": True,
                "download_count": 1247,
                "rating": 4.8
            },
            {
                "title": "Paris Hidden Art Galleries",
                "description": "Discover secret art spaces and cozy cafes in the artistic heart of Paris. A unique hand-drawn map for culture enthusiasts.",
                "city": "Paris",
                "country": "France",
                "category": "cultural",
                "map_type": "hand_drawn",
                "difficulty_level": "medium",
                "estimated_duration": "Full day (6-8 hours)",
                "price_type": "premium",
                "price": 18.99,
                "map_image_url": "https://example.com/maps/paris-art-map.jpg",
                "thumbnail_url": "https://example.com/thumbs/paris-art-thumb.jpg",
                "creator_name": "Parisian Artists Collective",
                "creator_type": "business",
                "tags": "art,culture,paris,galleries,museums,cafe,historic",
                "is_featured": True,
                "download_count": 892,
                "rating": 4.6
            },
            {
                "title": "San Francisco Coffee Culture Trail",
                "description": "From artisanal roasters to scenic coffee spots with Golden Gate views. Perfect for digital nomads and coffee connoisseurs.",
                "city": "San Francisco",
                "country": "USA",
                "category": "cafe",
                "map_type": "hybrid",
                "difficulty_level": "easy",
                "estimated_duration": "3-4 hours",
                "price_type": "free",
                "price": 0.0,
                "map_image_url": "https://example.com/maps/sf-coffee-map.jpg",
                "thumbnail_url": "https://example.com/thumbs/sf-coffee-thumb.jpg",
                "creator_name": "SF Coffee Community",
                "creator_type": "individual",
                "tags": "coffee,san francisco,golden gate,artisanal,roasters",
                "is_featured": False,
                "download_count": 543,
                "rating": 4.4
            },
            {
                "title": "Kyoto Temple & Tea House Walk",
                "description": "A meditative journey through ancient temples and traditional tea houses. Hand-drawn with love for cultural explorers.",
                "city": "Kyoto",
                "country": "Japan",
                "category": "cultural",
                "map_type": "hand_drawn",
                "difficulty_level": "easy",
                "estimated_duration": "4-5 hours",
                "price_type": "premium",
                "price": 12.99,
                "map_image_url": "https://example.com/maps/kyoto-temple-map.jpg",
                "thumbnail_url": "https://example.com/thumbs/kyoto-temple-thumb.jpg",
                "creator_name": "Kyoto Heritage Foundation",
                "creator_type": "official",
                "tags": "kyoto,temples,tea,culture,traditional,meditation,zen",
                "is_featured": True,
                "download_count": 1056,
                "rating": 4.9
            },
            {
                "title": "Berlin Street Art & Cafe Circuit",
                "description": "Alternative Berlin through street art murals and indie cafes. Custom map for creative souls and urban explorers.",
                "city": "Berlin",
                "country": "Germany",
                "category": "cultural",
                "map_type": "digital",
                "difficulty_level": "medium",
                "estimated_duration": "5-6 hours",
                "price_type": "custom",
                "price": 25.00,
                "map_image_url": "https://example.com/maps/berlin-street-art-map.jpg",
                "thumbnail_url": "https://example.com/thumbs/berlin-street-art-thumb.jpg",
                "creator_name": "Berlin Alternative Tours",
                "creator_type": "business",
                "tags": "berlin,street art,alternative,indie,cafes,urban,graffiti",
                "is_featured": False,
                "download_count": 324,
                "rating": 4.2
            }
        ]
        
        db_maps = []
        for i, map_data in enumerate(maps_data):
            db_map = models.Map(**map_data)
            db.add(db_map)
            db_maps.append(db_map)
        
        db.flush()  # Get map IDs
        
        # Associate points with maps
        # Tokyo map with Tokyo points
        db_maps[0].points.extend([db_points[0], db_points[1], db_points[2]])
        
        # Paris map with Paris points
        db_maps[1].points.extend([db_points[3], db_points[4], db_points[5]])
        
        # San Francisco map with SF points
        db_maps[2].points.extend([db_points[6], db_points[7]])
        
        # Create sample routes
        routes_data = [
            {
                "map_id": 1,  # Tokyo map
                "name": "Shinjuku to Shibuya Coffee Trail",
                "description": "Walk through Tokyo's busiest districts while coffee hopping",
                "route_type": "walking",
                "start_point_id": 1,  # Blue Bottle Shinjuku
                "end_point_id": 2,    # Shibuya Sky
                "distance_km": 2.8,
                "estimated_time": "45 minutes",
                "difficulty": "easy",
                "route_coordinates": json.dumps([
                    {"lat": 35.6938, "lng": 139.7034},
                    {"lat": 35.6762, "lng": 139.7025},
                    {"lat": 35.6581, "lng": 139.7016}
                ]),
                "highlights": "JR Yamanote Line views, Takeshita Street, Shibuya Crossing",
                "tips": "Best in the morning when crowds are lighter. Don't forget to charge your phone for photos!",
                "color_code": "#FF6B6B",
                "is_loop": False
            },
            {
                "map_id": 2,  # Paris map
                "name": "Left Bank Art Discovery Route",
                "description": "Artistic journey through historic Parisian neighborhoods",
                "route_type": "walking",
                "start_point_id": 4,  # Le Procope
                "end_point_id": 5,    # Sainte-Chapelle
                "distance_km": 1.2,
                "estimated_time": "25 minutes",
                "difficulty": "easy",
                "route_coordinates": json.dumps([
                    {"lat": 48.8529, "lng": 2.3390},
                    {"lat": 48.8541, "lng": 2.3421},
                    {"lat": 48.8553, "lng": 2.3451}
                ]),
                "highlights": "Latin Quarter cobblestones, Shakespeare and Company bookstore",
                "tips": "Perfect for sunset photos. Visit Sainte-Chapelle when the light hits the stained glass.",
                "color_code": "#4ECDC4",
                "is_loop": False
            }
        ]
        
        for route_data in routes_data:
            db_route = models.MapRoute(**route_data)
            db.add(db_route)
        
        # Create sample reviews
        reviews_data = [
            {
                "map_id": 1,
                "reviewer_name": "Sarah_Tokyo_Explorer",
                "rating": 5.0,
                "review_text": "Amazing hand-drawn map! Found 3 new favorite cafes and got incredible Instagram shots. The AR filters were a fun bonus!",
                "verified_visit": True,
                "helpful_count": 23
            },
            {
                "map_id": 1,
                "reviewer_name": "Coffee_Nomad_Mike",
                "rating": 4.5,
                "review_text": "Great routes and timing estimates were spot on. Blue Bottle was crowded but worth it. Perfect for a weekend adventure.",
                "verified_visit": True,
                "helpful_count": 18
            },
            {
                "map_id": 2,
                "reviewer_name": "ArtLover_Paris",
                "rating": 4.8,
                "review_text": "Discovered hidden galleries I never knew existed! The hand-drawn style gives it such a personal touch. Merci beaucoup!",
                "verified_visit": True,
                "helpful_count": 31
            },
            {
                "map_id": 4,
                "reviewer_name": "ZenSeeker_Kyoto",
                "rating": 5.0,
                "review_text": "Peaceful and well-curated route. Perfect for meditation and cultural immersion. The tea house recommendations were excellent.",
                "verified_visit": True,
                "helpful_count": 27
            }
        ]
        
        for review_data in reviews_data:
            db_review = models.MapReview(**review_data)
            db.add(db_review)
        
        db.commit()
        print("Successfully created sample maps data!")
        print("- 5 hand-drawn maps (targeting both C-end and B2B users)")
        print("- 8 points of interest (Instagram-worthy spots)")
        print("- 2 detailed routes with coordinates")
        print("- 4 authentic user reviews")
        print("\nMap categories created: cafe, cultural")
        print("Target user personas: Young travelers (20-35), coffee enthusiasts, culture seekers")
        print("Business features: Premium pricing, custom maps, AR content, social media integration")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_maps()
