from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import math
from app.database import get_db
from app import models, schemas
import math

router = APIRouter(prefix="/maps", tags=["maps"])

@router.get("/", response_model=schemas.MapListResponse)
async def get_maps(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country"),
    category: Optional[str] = Query(None, description="Filter by category"),
    map_type: Optional[str] = Query(None, description="Filter by map type"),
    price_type: Optional[str] = Query(None, description="Filter by price type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    featured_only: bool = Query(False, description="Show only featured maps"),
    search: Optional[str] = Query(None, description="Search in title, description, tags"),
    db: Session = Depends(get_db)
):
    """Get list of maps with filtering and pagination"""
    
    # Use eager loading for relationships
    query = db.query(models.Map).options(
        joinedload(models.Map.points),
        joinedload(models.Map.routes)
    ).filter(models.Map.is_active == True)
    
    # Apply filters
    if city:
        query = query.filter(models.Map.city.ilike(f"%{city}%"))
    if country:
        query = query.filter(models.Map.country.ilike(f"%{country}%"))
    if category:
        query = query.filter(models.Map.category == category)
    if map_type:
        query = query.filter(models.Map.map_type == map_type)
    if price_type:
        query = query.filter(models.Map.price_type == price_type)
    if difficulty:
        query = query.filter(models.Map.difficulty_level == difficulty)
    if featured_only:
        query = query.filter(models.Map.is_featured == True)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            models.Map.title.ilike(search_filter) |
            models.Map.description.ilike(search_filter) |
            models.Map.tags.ilike(search_filter)
        )
    
    # Order by featured first, then by rating and creation date
    query = query.order_by(
        models.Map.is_featured.desc(),
        models.Map.rating.desc(),
        models.Map.created_at.desc()
    )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    maps = query.offset(offset).limit(per_page).all()
    
    total_pages = math.ceil(total / per_page)
    
    return schemas.MapListResponse(
        maps=[schemas.MapResponse.model_validate(map_obj) for map_obj in maps],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{map_id}", response_model=schemas.MapDetailWithCanvasResponse)
async def get_map(map_id: int, db: Session = Depends(get_db)):
    """Get map details by ID with canvas data"""
    
    map_obj = db.query(models.Map).options(
        joinedload(models.Map.points),
        joinedload(models.Map.routes).joinedload(models.MapRoute.start_point),
        joinedload(models.Map.routes).joinedload(models.MapRoute.end_point),
        joinedload(models.Map.reviews),
        joinedload(models.Map.canvas)
    ).filter(models.Map.id == map_id).first()
    
    if not map_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    return map_obj

@router.post("/", response_model=schemas.MapResponse, status_code=status.HTTP_201_CREATED)
async def create_map(map_data: schemas.MapCreate, db: Session = Depends(get_db)):
    """Create a new map"""
    
    # Create the map without points first
    map_dict = map_data.dict(exclude={'point_ids'})
    db_map = models.Map(**map_dict)
    db.add(db_map)
    db.flush()  # To get the ID without committing
    
    # Add associated points if provided
    if map_data.point_ids:
        points = db.query(models.MapPoint).filter(
            models.MapPoint.id.in_(map_data.point_ids)
        ).all()
        db_map.points.extend(points)
    
    db.commit()
    db.refresh(db_map)
    return db_map

@router.put("/{map_id}", response_model=schemas.MapResponse)
async def update_map(
    map_id: int,
    map_data: schemas.MapUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing map"""
    
    db_map = db.query(models.Map).filter(models.Map.id == map_id).first()
    if not db_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    # Update fields
    update_data = map_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_map, field, value)
    
    db.commit()
    db.refresh(db_map)
    return db_map

@router.delete("/{map_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_map(map_id: int, db: Session = Depends(get_db)):
    """Soft delete a map (set as inactive)"""
    
    db_map = db.query(models.Map).filter(models.Map.id == map_id).first()
    if not db_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    db_map.is_active = False
    db.commit()

# Map Points endpoints
@router.get("/points/", response_model=List[schemas.MapPointResponse])
async def get_map_points(
    city: Optional[str] = Query(None, description="Filter by city"),
    point_type: Optional[str] = Query(None, description="Filter by point type"),
    instagram_worthy: Optional[bool] = Query(None, description="Filter Instagram-worthy spots"),
    db: Session = Depends(get_db)
):
    """Get list of map points"""
    
    query = db.query(models.MapPoint)
    
    if city:
        # Join with maps to filter by city
        query = query.join(models.Map, models.MapPoint.maps).filter(
            models.Map.city.ilike(f"%{city}%")
        )
    if point_type:
        query = query.filter(models.MapPoint.point_type == point_type)
    if instagram_worthy is not None:
        query = query.filter(models.MapPoint.instagram_worthy == instagram_worthy)
    
    points = query.all()
    return points

@router.post("/points/", response_model=schemas.MapPointResponse, status_code=status.HTTP_201_CREATED)
async def create_map_point(point_data: schemas.MapPointCreate, db: Session = Depends(get_db)):
    """Create a new map point"""
    
    db_point = models.MapPoint(**point_data.dict())
    db.add(db_point)
    db.commit()
    db.refresh(db_point)
    return db_point

@router.get("/points/search", response_model=List[schemas.MapPointResponse])
async def search_map_points_by_filters(
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country"),
    point_type: Optional[str] = Query(None, description="Filter by point type"),
    instagram_worthy: Optional[bool] = Query(None, description="Filter Instagram-worthy spots"),
    latitude: Optional[float] = Query(None, description="Latitude for proximity search"),
    longitude: Optional[float] = Query(None, description="Longitude for proximity search"),
    radius_km: Optional[float] = Query(5.0, description="Search radius in kilometers"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get map points with optional filtering and proximity search"""
    
    query = db.query(models.MapPoint)
    
    # Apply filters
    if city:
        query = query.filter(models.MapPoint.city.ilike(f"%{city}%"))
    if country:
        query = query.filter(models.MapPoint.country.ilike(f"%{country}%"))
    if point_type:
        query = query.filter(models.MapPoint.point_type == point_type)
    if instagram_worthy is not None:
        query = query.filter(models.MapPoint.instagram_worthy == instagram_worthy)
    
    # Proximity search (simplified - for production use PostGIS)
    if latitude is not None and longitude is not None and radius_km is not None:
        # Simple bounding box search
        lat_delta = radius_km / 111.0  # Rough conversion
        lng_delta = radius_km / (111.0 * math.cos(math.radians(latitude)))
        
        query = query.filter(
            models.MapPoint.latitude.between(latitude - lat_delta, latitude + lat_delta),
            models.MapPoint.longitude.between(longitude - lng_delta, longitude + lng_delta)
        )
    
    # Pagination
    offset = (page - 1) * per_page
    points = query.offset(offset).limit(per_page).all()
    
    return points

@router.get("/points/{point_id}", response_model=schemas.MapPointResponse)
async def get_map_point(point_id: int, db: Session = Depends(get_db)):
    """Get a specific map point by ID"""
    
    point = db.query(models.MapPoint).filter(models.MapPoint.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map point not found"
        )
    
    return point

@router.put("/points/{point_id}", response_model=schemas.MapPointResponse)
async def update_map_point(
    point_id: int,
    point_data: schemas.MapPointUpdate,
    db: Session = Depends(get_db)
):
    """Update a map point"""
    
    point = db.query(models.MapPoint).filter(models.MapPoint.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map point not found"
        )
    
    for field, value in point_data.dict(exclude_unset=True).items():
        setattr(point, field, value)
    
    db.commit()
    db.refresh(point)
    return point

@router.delete("/points/{point_id}")
async def delete_map_point(point_id: int, db: Session = Depends(get_db)):
    """Delete a map point"""
    
    point = db.query(models.MapPoint).filter(models.MapPoint.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map point not found"
        )
    
    db.delete(point)
    db.commit()
    return {"message": "Map point deleted successfully"}

@router.post("/points/search", response_model=List[schemas.MapPointResponse])
async def search_map_points(
    search_request: schemas.MapPointSearchRequest,
    db: Session = Depends(get_db)
):
    """Advanced search for map points by city, type, and location"""
    
    query = db.query(models.MapPoint)
    
    # City filter (required)
    query = query.filter(models.MapPoint.city.ilike(f"%{search_request.city}%"))
    
    # Optional filters
    if search_request.country:
        query = query.filter(models.MapPoint.country.ilike(f"%{search_request.country}%"))
    
    if search_request.point_type:
        query = query.filter(models.MapPoint.point_type == search_request.point_type)
    
    if search_request.search_query:
        search_filter = f"%{search_request.search_query}%"
        query = query.filter(
            models.MapPoint.name.ilike(search_filter) |
            models.MapPoint.description.ilike(search_filter) |
            models.MapPoint.address.ilike(search_filter)
        )
    
    # Proximity search
    if search_request.latitude and search_request.longitude and search_request.radius_km:
        lat_delta = search_request.radius_km / 111.0
        lng_delta = search_request.radius_km / (111.0 * math.cos(math.radians(search_request.latitude)))
        
        query = query.filter(
            models.MapPoint.latitude.between(
                search_request.latitude - lat_delta, 
                search_request.latitude + lat_delta
            ),
            models.MapPoint.longitude.between(
                search_request.longitude - lng_delta, 
                search_request.longitude + lng_delta
            )
        )
    
    return query.limit(100).all()  # Limit results for performance

# Map Routes endpoints
@router.get("/{map_id}/routes/", response_model=List[schemas.MapRouteResponse])
async def get_map_routes(map_id: int, db: Session = Depends(get_db)):
    """Get all routes for a specific map"""
    
    routes = db.query(models.MapRoute).filter(models.MapRoute.map_id == map_id).all()
    return routes

@router.post("/{map_id}/routes/", response_model=schemas.MapRouteResponse, status_code=status.HTTP_201_CREATED)
async def create_map_route(
    map_id: int,
    route_data: schemas.MapRouteCreate,
    db: Session = Depends(get_db)
):
    """Create a new route for a map"""
    
    # Verify map exists
    map_obj = db.query(models.Map).filter(models.Map.id == map_id).first()
    if not map_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    route_dict = route_data.dict()
    route_dict['map_id'] = map_id
    db_route = models.MapRoute(**route_dict)
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

# Map Reviews endpoints
@router.get("/{map_id}/reviews/", response_model=List[schemas.MapReviewResponse])
async def get_map_reviews(
    map_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific map"""
    
    query = db.query(models.MapReview).filter(models.MapReview.map_id == map_id)
    query = query.order_by(models.MapReview.created_at.desc())
    
    offset = (page - 1) * per_page
    reviews = query.offset(offset).limit(per_page).all()
    return reviews

@router.post("/{map_id}/reviews/", response_model=schemas.MapReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_map_review(
    map_id: int,
    review_data: schemas.MapReviewCreate,
    db: Session = Depends(get_db)
):
    """Create a new review for a map"""
    
    # Verify map exists
    map_obj = db.query(models.Map).filter(models.Map.id == map_id).first()
    if not map_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    review_dict = review_data.dict()
    review_dict['map_id'] = map_id
    db_review = models.MapReview(**review_dict)
    db.add(db_review)
    db.commit()
    
    # Update map rating
    avg_rating = db.query(models.MapReview).filter(
        models.MapReview.map_id == map_id
    ).with_entities(models.MapReview.rating).all()
    
    if avg_rating:
        new_rating = sum(r[0] for r in avg_rating) / len(avg_rating)
        map_obj.rating = round(new_rating, 1)
        db.commit()
    
    db.refresh(db_review)
    return db_review

# Additional utility endpoints
@router.get("/categories/", response_model=List[str])
async def get_map_categories(db: Session = Depends(get_db)):
    """Get list of available map categories"""
    
    categories = db.query(models.Map.category).distinct().filter(
        models.Map.is_active == True
    ).all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/cities/", response_model=List[dict])
async def get_map_cities(db: Session = Depends(get_db)):
    """Get list of cities with available maps"""
    
    cities = db.query(
        models.Map.city, 
        models.Map.country,
        models.Map.id.label('map_count')
    ).filter(
        models.Map.is_active == True
    ).group_by(models.Map.city, models.Map.country).all()
    
    return [
        {
            "city": city[0],
            "country": city[1],
            "map_count": len([c for c in cities if c[0] == city[0] and c[1] == city[1]])
        }
        for city in cities
    ]


@router.get("/cities/search", response_model=List[dict])
async def search_cities(
    query: str = Query(..., description="City name to search for"),
    db: Session = Depends(get_db)
):
    """Search for cities with existing map points"""
    
    # Search in both maps and map points for cities
    map_cities = db.query(models.Map.city, models.Map.country).filter(
        models.Map.city.ilike(f"%{query}%"),
        models.Map.is_active == True
    ).distinct().all()
    
    point_cities = db.query(models.MapPoint.city, models.MapPoint.country).filter(
        models.MapPoint.city.ilike(f"%{query}%")
    ).distinct().all()
    
    # Combine and deduplicate
    all_cities = set(map_cities + point_cities)
    
    return [
        {
            "city": city[0] if city[0] else "",
            "country": city[1] if city[1] else "",
            "full_name": f"{city[0]}, {city[1]}" if city[0] and city[1] else city[0] or city[1] or ""
        }
        for city in all_cities
        if city[0]  # Only include results with valid city names
    ]


# Hand-drawn canvas endpoints
@router.post("/{map_id}/canvas/", response_model=schemas.HandDrawnCanvasResponse, status_code=status.HTTP_201_CREATED)
async def create_hand_drawn_canvas(
    map_id: int,
    canvas_data: schemas.HandDrawnCanvasCreate,
    db: Session = Depends(get_db)
):
    """Create or update a hand-drawn canvas for a map"""
    
    # Verify map exists
    map_obj = db.query(models.Map).filter(models.Map.id == map_id).first()
    if not map_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    # Check if canvas already exists
    existing_canvas = db.query(models.HandDrawnCanvas).filter(
        models.HandDrawnCanvas.map_id == map_id
    ).first()
    
    if existing_canvas:
        # Update existing canvas
        for field, value in canvas_data.dict(exclude_unset=True).items():
            setattr(existing_canvas, field, value)
        db.commit()
        db.refresh(existing_canvas)
        return existing_canvas
    else:
        # Create new canvas
        canvas_dict = canvas_data.dict()
        canvas_dict['map_id'] = map_id
        db_canvas = models.HandDrawnCanvas(**canvas_dict)
        db.add(db_canvas)
        db.commit()
        db.refresh(db_canvas)
        return db_canvas


@router.get("/{map_id}/canvas/", response_model=schemas.HandDrawnCanvasResponse)
async def get_hand_drawn_canvas(map_id: int, db: Session = Depends(get_db)):
    """Get the hand-drawn canvas for a map"""
    
    canvas = db.query(models.HandDrawnCanvas).filter(
        models.HandDrawnCanvas.map_id == map_id
    ).first()
    
    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found for this map"
        )
    
    return canvas


@router.put("/{map_id}/canvas/", response_model=schemas.HandDrawnCanvasResponse)
async def update_hand_drawn_canvas(
    map_id: int,
    canvas_data: schemas.HandDrawnCanvasUpdate,
    db: Session = Depends(get_db)
):
    """Update a hand-drawn canvas for a map"""
    
    canvas = db.query(models.HandDrawnCanvas).filter(
        models.HandDrawnCanvas.map_id == map_id
    ).first()
    
    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found for this map"
        )
    
    for field, value in canvas_data.dict(exclude_unset=True).items():
        setattr(canvas, field, value)
    
    db.commit()
    db.refresh(canvas)
    return canvas


@router.delete("/{map_id}/canvas/")
async def delete_hand_drawn_canvas(map_id: int, db: Session = Depends(get_db)):
    """Delete a hand-drawn canvas for a map"""
    
    canvas = db.query(models.HandDrawnCanvas).filter(
        models.HandDrawnCanvas.map_id == map_id
    ).first()
    
    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found for this map"
        )
    
    db.delete(canvas)
    db.commit()
    return {"message": "Canvas deleted successfully"}
