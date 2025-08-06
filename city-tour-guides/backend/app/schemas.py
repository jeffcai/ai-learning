from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TourGuideBase(BaseModel):
    name: str
    city: str
    country: str
    description: Optional[str] = None
    languages: str  # Comma-separated languages
    price_per_hour: float
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    years_experience: Optional[int] = 0
    specialties: Optional[str] = None
    availability: Optional[bool] = True
    profile_image_url: Optional[str] = None

class TourGuideCreate(TourGuideBase):
    pass

class TourGuideUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    languages: Optional[str] = None
    price_per_hour: Optional[float] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    years_experience: Optional[int] = None
    specialties: Optional[str] = None
    availability: Optional[bool] = None
    profile_image_url: Optional[str] = None

class TourGuideResponse(TourGuideBase):
    id: int
    rating: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TourGuideList(BaseModel):
    tour_guides: List[TourGuideResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# Map Schemas
class MapPointBase(BaseModel):
    name: str
    description: Optional[str] = None
    point_type: str  # cafe, restaurant, landmark, viewpoint, start, end
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    place_id: Optional[str] = None
    opening_hours: Optional[str] = None
    contact_info: Optional[str] = None
    image_url: Optional[str] = None
    icon_type: Optional[str] = None
    priority: Optional[int] = 1
    instagram_worthy: Optional[bool] = False
    ar_content_url: Optional[str] = None
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    created_by: Optional[str] = None
    is_verified: Optional[bool] = False

class MapPointCreate(MapPointBase):
    pass

class MapPointUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    point_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    place_id: Optional[str] = None
    opening_hours: Optional[str] = None
    contact_info: Optional[str] = None
    image_url: Optional[str] = None
    icon_type: Optional[str] = None
    priority: Optional[int] = None
    instagram_worthy: Optional[bool] = None
    ar_content_url: Optional[str] = None
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    created_by: Optional[str] = None
    is_verified: Optional[bool] = None

class MapPointResponse(MapPointBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MapPointSearchRequest(BaseModel):
    city: str
    country: Optional[str] = None
    point_type: Optional[str] = None
    search_query: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = 5.0


class MapRouteBase(BaseModel):
    name: str
    description: Optional[str] = None
    route_type: str  # walking, cycling, driving, mixed
    start_point_id: Optional[int] = None
    end_point_id: Optional[int] = None
    distance_km: Optional[float] = None
    estimated_time: Optional[str] = None
    difficulty: Optional[str] = None
    route_coordinates: Optional[str] = None  # JSON string
    highlights: Optional[str] = None
    tips: Optional[str] = None
    color_code: Optional[str] = "#FF5722"
    is_loop: Optional[bool] = False

class MapRouteCreate(MapRouteBase):
    pass

class MapRouteResponse(MapRouteBase):
    id: int
    map_id: int
    created_at: datetime
    start_point: Optional[MapPointResponse] = None
    end_point: Optional[MapPointResponse] = None

    class Config:
        from_attributes = True


class MapReviewBase(BaseModel):
    reviewer_name: str
    rating: float
    review_text: Optional[str] = None
    visit_date: Optional[datetime] = None
    verified_visit: Optional[bool] = False

class MapReviewCreate(MapReviewBase):
    pass

class MapReviewResponse(MapReviewBase):
    id: int
    map_id: int
    helpful_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class MapBase(BaseModel):
    title: str
    description: Optional[str] = None
    city: str
    country: str
    category: str  # cafe, museum, hiking, cultural, etc.
    map_type: str  # hand_drawn, digital, hybrid
    difficulty_level: Optional[str] = None
    estimated_duration: Optional[str] = None
    price_type: str  # free, premium, custom
    price: Optional[float] = 0.0
    map_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    creator_name: Optional[str] = None
    creator_type: Optional[str] = "individual"
    tags: Optional[str] = None
    is_featured: Optional[bool] = False

class MapCreate(MapBase):
    point_ids: Optional[List[int]] = []  # List of point IDs to associate

class MapUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    map_type: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration: Optional[str] = None
    price_type: Optional[str] = None
    price: Optional[float] = None
    map_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    creator_name: Optional[str] = None
    creator_type: Optional[str] = None
    tags: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class MapResponse(MapBase):
    id: int
    download_count: int
    rating: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    points: List[MapPointResponse] = []
    routes: List[MapRouteResponse] = []

    class Config:
        from_attributes = True

class MapListResponse(BaseModel):
    maps: List[MapResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class MapDetailResponse(MapResponse):
    reviews: List[MapReviewResponse] = []


# Hand-drawn canvas schemas
class HandDrawnCanvasBase(BaseModel):
    canvas_data: str  # JSON string of canvas drawing data
    canvas_width: Optional[int] = 800
    canvas_height: Optional[int] = 600
    background_image_url: Optional[str] = None
    drawing_layers: Optional[str] = None

class HandDrawnCanvasCreate(HandDrawnCanvasBase):
    pass

class HandDrawnCanvasUpdate(BaseModel):
    canvas_data: Optional[str] = None
    canvas_width: Optional[int] = None
    canvas_height: Optional[int] = None
    background_image_url: Optional[str] = None
    drawing_layers: Optional[str] = None

class HandDrawnCanvasResponse(HandDrawnCanvasBase):
    id: int
    map_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Extended map schemas with canvas
class MapWithCanvasResponse(MapResponse):
    canvas: Optional[HandDrawnCanvasResponse] = None

class MapDetailWithCanvasResponse(MapWithCanvasResponse):
    reviews: List[MapReviewResponse] = []


# Request schema for associating points with maps
class AssociatePointsRequest(BaseModel):
    point_ids: List[int]
