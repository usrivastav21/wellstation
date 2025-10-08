#!/bin/bash
echo "🚀 Starting server in DEVELOPMENT mode..."
echo "📁 Loading .env.development file..."
export FLASK_ENV=development
python3 run.py
