#!/bin/bash

# City Tour Guides - Development Setup Script

set -e  # Exit on any error

echo "🚀 Setting up City Tour Guides Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please update with your settings)"
fi

# Create sample data
echo "Creating sample data..."
python seed_data.py

echo "✅ Backend setup complete"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "✅ Created .env.local file"
fi

echo "✅ Frontend setup complete"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If backend fails, check that all dependencies installed correctly"
echo "   - If frontend fails, try 'npm install' again in the frontend directory"
echo "   - Make sure ports 3000 and 8000 are not already in use"
