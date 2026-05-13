from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, init_db, get_db
import models
from routers import workers, users, contacts

# Create database tables
init_db()

app = FastAPI(
    title="Santexnik.uz API",
    description="API for professional workers platform in Uzbekistan",
    version="1.0.0"
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(users.router)
app.include_router(workers.router)
app.include_router(contacts.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Santexnik.uz API"}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics for the frontend."""
    total_workers = db.query(models.Worker).filter(models.Worker.is_active == True).count()
    total_reviews = db.query(models.Review).count()
    total_users = db.query(models.User).count()
    
    # Average rating across all workers
    from sqlalchemy import func
    avg_rating = db.query(func.avg(models.Worker.avg_rating)).filter(
        models.Worker.is_active == True,
        models.Worker.total_reviews > 0
    ).scalar() or 0
    
    # Count by category
    categories = db.query(
        models.Worker.category,
        func.count(models.Worker.id)
    ).filter(
        models.Worker.is_active == True
    ).group_by(models.Worker.category).all()
    
    return {
        "total_workers": total_workers,
        "total_reviews": total_reviews,
        "total_users": total_users,
        "avg_rating": round(float(avg_rating), 1),
        "categories": {cat: count for cat, count in categories}
    }
