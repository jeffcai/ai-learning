#!/bin/bash

echo "Setting up Reader Digest Backend..."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your configuration"
fi

echo "Backend setup complete!"
echo "To start the backend server, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"
