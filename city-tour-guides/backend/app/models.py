from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for many-to-many relationship between maps and points
map_points = Table(
    'map_points',
    Base.metadata,
    Column('map_id', Integer, ForeignKey('maps.id'), primary_key=True),
    Column('point_id', Integer, ForeignKey('map_points_detail.id'), primary_key=True)
)

class TourGuide(Base):
    __tablename__ = "tour_guides"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    languages = Column(String(200), nullable=False)  # Comma-separated languages
    rating = Column(Float, default=0.0)
    price_per_hour = Column(Float, nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    years_experience = Column(Integer, default=0)
    specialties = Column(Text, nullable=True)  # JSON string of specialties
    availability = Column(Boolean, default=True)
    profile_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<TourGuide(name='{self.name}', city='{self.city}', country='{self.country}')>"


class Map(Base):
    __tablename__ = "maps"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # cafe, museum, hiking, cultural, etc.
    map_type = Column(String(30), nullable=False)  # hand_drawn, digital, hybrid
    difficulty_level = Column(String(20))  # easy, medium, hard (for hiking routes)
    estimated_duration = Column(String(50))  # "2-3 hours", "Half day", etc.
    price_type = Column(String(20), nullable=False)  # free, premium, custom
    price = Column(Float, default=0.0)
    map_image_url = Column(String(500))
    thumbnail_url = Column(String(500))
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    creator_name = Column(String(100))
    creator_type = Column(String(20), default="individual")  # individual, business, official
    tags = Column(String(300))  # Comma-separated tags for search
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    points = relationship("MapPoint", secondary=map_points, back_populates="maps")
    routes = relationship("MapRoute", back_populates="map", cascade="all, delete-orphan")
    reviews = relationship("MapReview", back_populates="map", cascade="all, delete-orphan")
    canvas = relationship("HandDrawnCanvas", back_populates="map", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Map(title='{self.title}', city='{self.city}', category='{self.category}')>"


class MapPoint(Base):
    __tablename__ = "map_points_detail"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    point_type = Column(String(50), nullable=False)  # cafe, restaurant, landmark, viewpoint, start, end
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(300))
    city = Column(String(100))  # City where the point is located
    country = Column(String(100))  # Country where the point is located
    place_id = Column(String(200))  # Google Places ID or similar external reference
    opening_hours = Column(String(200))
    contact_info = Column(String(200))
    image_url = Column(String(500))
    icon_type = Column(String(50))  # coffee, camera, mountain, etc.
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    instagram_worthy = Column(Boolean, default=False)  # For social media content
    ar_content_url = Column(String(500))  # AR filter/content link
    canvas_x = Column(Float)  # X coordinate on hand-drawn canvas (optional)
    canvas_y = Column(Float)  # Y coordinate on hand-drawn canvas (optional)
    created_by = Column(String(100))  # User who created this point
    is_verified = Column(Boolean, default=False)  # Whether the point has been verified
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    maps = relationship("Map", secondary=map_points, back_populates="points")

    def __repr__(self):
        return f"<MapPoint(name='{self.name}', type='{self.point_type}', lat={self.latitude}, lng={self.longitude})>"


class MapRoute(Base):
    __tablename__ = "map_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    map_id = Column(Integer, ForeignKey('maps.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    route_type = Column(String(30), nullable=False)  # walking, cycling, driving, mixed
    start_point_id = Column(Integer, ForeignKey('map_points_detail.id'))
    end_point_id = Column(Integer, ForeignKey('map_points_detail.id'))
    distance_km = Column(Float)
    estimated_time = Column(String(50))
    difficulty = Column(String(20))  # easy, medium, hard
    route_coordinates = Column(Text)  # JSON string of lat/lng coordinates
    highlights = Column(Text)  # Key attractions along the route
    tips = Column(Text)  # Navigation tips and advice
    color_code = Column(String(10), default="#FF5722")  # Hex color for map display
    is_loop = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    map = relationship("Map", back_populates="routes")
    start_point = relationship("MapPoint", foreign_keys=[start_point_id])
    end_point = relationship("MapPoint", foreign_keys=[end_point_id])

    def __repr__(self):
        return f"<MapRoute(name='{self.name}', type='{self.route_type}')>"


class MapReview(Base):
    __tablename__ = "map_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    map_id = Column(Integer, ForeignKey('maps.id'), nullable=False)
    reviewer_name = Column(String(100), nullable=False)
    rating = Column(Float, nullable=False)
    review_text = Column(Text)
    visit_date = Column(DateTime(timezone=True))
    verified_visit = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    map = relationship("Map", back_populates="reviews")

    def __repr__(self):
        return f"<MapReview(rating={self.rating}, reviewer='{self.reviewer_name}')>"


class HandDrawnCanvas(Base):
    __tablename__ = "hand_drawn_canvas"
    
    id = Column(Integer, primary_key=True, index=True)
    map_id = Column(Integer, ForeignKey('maps.id'), nullable=False)
    canvas_data = Column(Text, nullable=False)  # JSON string of canvas drawing data
    canvas_width = Column(Integer, default=800)
    canvas_height = Column(Integer, default=600)
    background_image_url = Column(String(500))  # Optional background map image
    drawing_layers = Column(Text)  # JSON string of different drawing layers
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    map = relationship("Map", back_populates="canvas")

    def __repr__(self):
        return f"<HandDrawnCanvas(map_id={self.map_id}, canvas_size={self.canvas_width}x{self.canvas_height})>"
