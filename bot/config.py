import os

BOT_TOKEN = os.getenv("BOT_TOKEN", "8966416865:AAGT1Noq62gCAxZGtRT_jCVrP8Ln75uvi_4")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000") # URL of the FastAPI backend

# Admins list
SUPER_ADMIN_ID = int(os.getenv("SUPER_ADMIN_ID", 123456789)) # Replace with the developer's telegram ID

