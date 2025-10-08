#!/bin/bash
echo "🚀 Starting server in PRODUCTION mode..."
echo "📁 Loading .env.production file..."
export FLASK_ENV=production
python3 run.py
