from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tour_guides, maps
from app.database import engine
from app import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="City Tour Guides & Maps API",
    description="A REST API for managing city tour guides and hand-drawn maps",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tour_guides.router, prefix="/api/v1")
app.include_router(maps.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "City Tour Guides & Maps API", 
        "version": "2.0.0",
        "features": ["tour_guides", "hand_drawn_maps", "routes", "points_of_interest"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
