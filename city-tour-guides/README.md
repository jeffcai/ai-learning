# City Tour Guides

A full-stack web application to find and book city tour guides built with Python FastAPI backend and Next.js frontend.

## Features

- 🗺️ Browse tour guides by city and country
- ⭐ Filter by rating, price, and languages
- 📱 Responsive design for mobile and desktop
- 🔍 Advanced search functionality
- 💬 Contact tour guides directly
- 📊 Detailed guide profiles with specialties

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (can be replaced with PostgreSQL)
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create sample data:**
   ```bash
   python seed_data.py
   ```

6. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at: http://localhost:8000
   API docs at: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed (default API URL is correct)
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at: http://localhost:3000

## API Endpoints

### Tour Guides
- `GET /api/v1/tour-guides/` - List all tour guides with filters
- `GET /api/v1/tour-guides/{id}` - Get specific tour guide
- `POST /api/v1/tour-guides/` - Create new tour guide
- `PUT /api/v1/tour-guides/{id}` - Update tour guide
- `DELETE /api/v1/tour-guides/{id}` - Delete tour guide
- `GET /api/v1/tour-guides/cities/list` - Get list of cities

### Query Parameters (for listing)
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)
- `city` - Filter by city
- `country` - Filter by country
- `min_rating` - Minimum rating
- `max_price` - Maximum price per hour
- `language` - Filter by language

## Database Schema

### TourGuide Model
```python
{
    "id": int,
    "name": str,
    "city": str,
    "country": str,
    "description": str,
    "languages": str,  # Comma-separated
    "rating": float,
    "price_per_hour": float,
    "contact_email": str,
    "contact_phone": str,
    "years_experience": int,
    "specialties": str,  # Comma-separated
    "availability": bool,
    "profile_image_url": str,
    "created_at": datetime,
    "updated_at": datetime
}
```

## Sample Data

The application comes with 6 sample tour guides from different cities:
- Marco Rossi (Rome, Italy)
- Sophie Dubois (Paris, France)
- Kenji Tanaka (Tokyo, Japan)
- Isabella García (Barcelona, Spain)
- James Wilson (London, UK)
- Emma Müller (Berlin, Germany)

## Development

### Backend Development
```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Check API documentation
open http://localhost:8000/docs
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Production Deployment

### Backend
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Install production dependencies
4. Use a production ASGI server like Gunicorn
5. Set up reverse proxy with Nginx

### Frontend
1. Build the application: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or your own server
3. Update `NEXT_PUBLIC_API_URL` to point to your production API

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///./tour_guides.db
SECRET_KEY=your-secret-key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

## Project Structure

city-tour-guides/
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application
│   │   ├── database.py     # Database configuration
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── routers/
│   │       └── tour_guides.py # API routes
│   ├── requirements.txt    # Python dependencies
│   ├── seed_data.py       # Sample data generator
│   └── .env.example       # Environment template
├── frontend/               # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx     # App layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── Header.tsx     # Navigation header
│   │   ├── TourGuideCard.tsx # Guide card component
│   │   └── SearchFilters.tsx # Search/filter component
│   ├── services/
│   │   └── api.ts         # API service layer
│   ├── package.json       # Node.js dependencies
│   └── next.config.js     # Next.js configuration
├── setup.sh              # Automated setup script
└── README.md             # Complete documentation