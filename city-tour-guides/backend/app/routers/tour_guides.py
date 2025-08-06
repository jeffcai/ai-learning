from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
import math

router = APIRouter(prefix="/tour-guides", tags=["tour-guides"])

@router.get("/", response_model=schemas.TourGuideList)
async def get_tour_guides(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per hour"),
    language: Optional[str] = Query(None, description="Filter by language"),
    db: Session = Depends(get_db)
):
    """Get list of tour guides with optional filtering and pagination"""
    
    query = db.query(models.TourGuide).filter(models.TourGuide.availability == True)
    
    # Apply filters
    if city:
        query = query.filter(models.TourGuide.city.ilike(f"%{city}%"))
    if country:
        query = query.filter(models.TourGuide.country.ilike(f"%{country}%"))
    if min_rating:
        query = query.filter(models.TourGuide.rating >= min_rating)
    if max_price:
        query = query.filter(models.TourGuide.price_per_hour <= max_price)
    if language:
        query = query.filter(models.TourGuide.languages.ilike(f"%{language}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    tour_guides = query.offset(offset).limit(per_page).all()
    
    total_pages = math.ceil(total / per_page)
    
    return schemas.TourGuideList(
        tour_guides=tour_guides,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{guide_id}", response_model=schemas.TourGuideResponse)
async def get_tour_guide(guide_id: int, db: Session = Depends(get_db)):
    """Get a specific tour guide by ID"""
    
    tour_guide = db.query(models.TourGuide).filter(models.TourGuide.id == guide_id).first()
    if not tour_guide:
        raise HTTPException(status_code=404, detail="Tour guide not found")
    
    return tour_guide

@router.post("/", response_model=schemas.TourGuideResponse, status_code=201)
async def create_tour_guide(
    tour_guide: schemas.TourGuideCreate,
    db: Session = Depends(get_db)
):
    """Create a new tour guide"""
    
    # Check if email already exists
    existing_guide = db.query(models.TourGuide).filter(
        models.TourGuide.contact_email == tour_guide.contact_email
    ).first()
    
    if existing_guide:
        raise HTTPException(
            status_code=400, 
            detail="Tour guide with this email already exists"
        )
    
    db_tour_guide = models.TourGuide(**tour_guide.dict())
    db.add(db_tour_guide)
    db.commit()
    db.refresh(db_tour_guide)
    
    return db_tour_guide

@router.put("/{guide_id}", response_model=schemas.TourGuideResponse)
async def update_tour_guide(
    guide_id: int,
    tour_guide_update: schemas.TourGuideUpdate,
    db: Session = Depends(get_db)
):
    """Update a tour guide"""
    
    tour_guide = db.query(models.TourGuide).filter(models.TourGuide.id == guide_id).first()
    if not tour_guide:
        raise HTTPException(status_code=404, detail="Tour guide not found")
    
    # Update only provided fields
    update_data = tour_guide_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tour_guide, field, value)
    
    db.commit()
    db.refresh(tour_guide)
    
    return tour_guide

@router.delete("/{guide_id}")
async def delete_tour_guide(guide_id: int, db: Session = Depends(get_db)):
    """Delete a tour guide"""
    
    tour_guide = db.query(models.TourGuide).filter(models.TourGuide.id == guide_id).first()
    if not tour_guide:
        raise HTTPException(status_code=404, detail="Tour guide not found")
    
    db.delete(tour_guide)
    db.commit()
    
    return {"message": "Tour guide deleted successfully"}

@router.get("/cities/list")
async def get_cities(db: Session = Depends(get_db)):
    """Get list of all cities with tour guides"""
    
    cities = db.query(models.TourGuide.city, models.TourGuide.country).distinct().all()
    
    return [{"city": city, "country": country} for city, country in cities]
