#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🌱 Seeding the database..."
python backend/seed.py

echo "🚀 Starting FastAPI backend in the background..."
cd backend
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} &
cd ..

echo "🤖 Starting Telegram bot..."
python bot/bot.py
