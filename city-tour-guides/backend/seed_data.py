import json
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

def create_sample_data():
    """Create sample tour guide data"""
    
    sample_guides = [
        {
            "name": "Marco Rossi",
            "city": "Rome",
            "country": "Italy",
            "description": "Passionate historian and Rome native with deep knowledge of ancient Roman history and architecture. I'll take you through hidden gems and famous landmarks with fascinating stories.",
            "languages": "Italian, English, Spanish",
            "rating": 4.8,
            "price_per_hour": 45.0,
            "contact_email": "marco.rossi@email.com",
            "contact_phone": "+39 06 1234567",
            "years_experience": 8,
            "specialties": "Ancient History, Architecture, Food Tours",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
        },
        {
            "name": "Sophie Dubois",
            "city": "Paris",
            "country": "France",
            "description": "Art historian and Paris expert specializing in museums, galleries, and French culture. Join me for an unforgettable journey through the City of Light!",
            "languages": "French, English, German",
            "rating": 4.9,
            "price_per_hour": 55.0,
            "contact_email": "sophie.dubois@email.com",
            "contact_phone": "+33 1 23 45 67 89",
            "years_experience": 12,
            "specialties": "Art History, Museums, French Culture, Wine Tours",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
        },
        {
            "name": "Kenji Tanaka",
            "city": "Tokyo",
            "country": "Japan",
            "description": "Local Tokyo resident with expertise in both traditional and modern Japanese culture. I'll show you the perfect blend of ancient temples and cutting-edge technology.",
            "languages": "Japanese, English, Mandarin",
            "rating": 4.7,
            "price_per_hour": 50.0,
            "contact_email": "kenji.tanaka@email.com",
            "contact_phone": "+81 3 1234 5678",
            "years_experience": 6,
            "specialties": "Traditional Culture, Technology, Food, Temples",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
        },
        {
            "name": "Isabella García",
            "city": "Barcelona",
            "country": "Spain",
            "description": "Certified guide with deep knowledge of Gaudí's architecture and Catalonian culture. Let me show you the most beautiful and authentic parts of Barcelona.",
            "languages": "Spanish, Catalan, English, French",
            "rating": 4.9,
            "price_per_hour": 40.0,
            "contact_email": "isabella.garcia@email.com",
            "contact_phone": "+34 93 123 4567",
            "years_experience": 10,
            "specialties": "Architecture, Gaudí, Art, Local Culture, Tapas Tours",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
        },
        {
            "name": "James Wilson",
            "city": "London",
            "country": "United Kingdom",
            "description": "History enthusiast and London local with 15 years of guiding experience. I specialize in royal history, museums, and traditional British culture.",
            "languages": "English, French",
            "rating": 4.6,
            "price_per_hour": 60.0,
            "contact_email": "james.wilson@email.com",
            "contact_phone": "+44 20 1234 5678",
            "years_experience": 15,
            "specialties": "Royal History, Museums, British Culture, Pubs",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
        },
        {
            "name": "Emma Müller",
            "city": "Berlin",
            "country": "Germany",
            "description": "Modern history specialist focusing on Berlin's complex 20th-century history. I offer engaging tours about WWII, Cold War, and Berlin's reunification.",
            "languages": "German, English, Russian",
            "rating": 4.8,
            "price_per_hour": 48.0,
            "contact_email": "emma.muller@email.com",
            "contact_phone": "+49 30 12345678",
            "years_experience": 9,
            "specialties": "Modern History, WWII, Cold War, Politics",
            "availability": True,
            "profile_image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face"
        }
    ]
    
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(models.TourGuide).delete()
        
        # Add sample data
        for guide_data in sample_guides:
            guide = models.TourGuide(**guide_data)
            db.add(guide)
        
        db.commit()
        print(f"Successfully created {len(sample_guides)} sample tour guides!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
