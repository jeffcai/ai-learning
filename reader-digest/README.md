# Reader Digest

A full-stack web application for tracking your reading journey, taking notes, and generating weekly digests of what you've read.

## Features

- **Article Management**: Post articles you've read with notes and tags
- **Multiple View Modes**: List, card, and magazine views for articles
- **Weekly Digests**: Automatically generate weekly summaries of your reading
- **User Authentication**: Support for both regular registration and social login
- **Public & Private Content**: Share articles publicly or keep them private
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Python Flask**: RESTful API server
- **SQLite**: Database for storing articles, users, and digests
- **Flask-JWT-Extended**: JWT authentication
- **Flask-SQLAlchemy**: ORM for database operations
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API calls

## Project Structure

```
reader-digest/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── models/             # Database models
│   ├── routes/             # API route handlers
│   │   ├── auth.py         # Authentication routes
│   │   ├── articles.py     # Article management
│   │   ├── digests.py      # Weekly digest routes
│   │   └── users.py        # User management
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── setup.sh           # Backend setup script
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── lib/          # Utilities and API client
│   ├── .env.local        # Frontend environment variables
│   └── setup.sh          # Frontend setup script
├── start-dev.sh          # Start both servers
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/oauth/google` - Google OAuth login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### Articles
- `GET /api/v1/articles` - List articles (public or user's own)
- `POST /api/v1/articles` - Create new article
- `GET /api/v1/articles/{id}` - Get specific article
- `PUT /api/v1/articles/{id}` - Update article
- `DELETE /api/v1/articles/{id}` - Delete article

### Digests
- `GET /api/v1/digests` - List digests
- `POST /api/v1/digests` - Create new digest
- `GET /api/v1/digests/{id}` - Get specific digest
- `PUT /api/v1/digests/{id}` - Update digest
- `DELETE /api/v1/digests/{id}` - Delete digest
- `POST /api/v1/digests/generate-weekly` - Generate weekly digest

### Users
- `GET /api/v1/users` - List users (public profiles)
- `GET /api/v1/users/{id}` - Get user profile
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/change-password` - Change password
- `POST /api/v1/users/deactivate` - Deactivate account

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Setup and Run

1. **Clone and setup the project:**
   ```bash
   cd reader-digest
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   ./setup.sh
   # Update .env file with your configuration
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   ./setup.sh
   ```

4. **Start Development Servers:**
   ```bash
   cd ..
   ./start-dev.sh
   ```

   This will start:
   - Backend API server at `http://localhost:5000`
   - Frontend development server at `http://localhost:3000`

### Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start server
python app.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Configuration

### Backend (.env)
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///reader_digest.db

# OAuth Settings (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Usage

### For Regular Users
1. **Register/Login**: Create an account or login with existing credentials
2. **Add Articles**: Click "Add Article" to post what you're reading
3. **Take Notes**: Add your thoughts and tag articles
4. **Browse**: Explore articles from other users in different view modes
5. **Weekly Digests**: Generate and publish weekly reading summaries

### For Admin Users
- Access admin panel to manage articles and digests
- Create and edit weekly digests
- Manage privacy settings for content

## Development

### Adding New Features
1. **Backend**: Add new routes in `backend/routes/`
2. **Frontend**: Create components in `src/components/`
3. **Database**: Update models in `backend/models/models.py`
4. **API Client**: Add new API calls in `src/lib/api.ts`

### Database Migration
The app automatically creates tables on first run. For schema changes:
1. Update models in `models/models.py`
2. Delete the existing database file (development only)
3. Restart the backend server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- AI-powered article summarization
- RSS feed import
- Article recommendation system
- Export functionality (PDF, EPUB)
- Mobile app
- Social features (following, likes, comments)
- Advanced analytics and reading statistics

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support, please open an issue on the GitHub repository.
