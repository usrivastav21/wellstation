#!/bin/bash
# WellStation Backend Startup Script

echo "Starting WellStation Backend..."
echo "Activating virtual environment..."

# Activate virtual environment
source venv/bin/activate

# Run the application
echo "Running Flask application..."
python run.py

