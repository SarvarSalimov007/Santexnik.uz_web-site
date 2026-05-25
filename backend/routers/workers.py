from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from sqlalchemy import desc

router = APIRouter(prefix="/workers", tags=["Workers"])

@router.get("/", response_model=List[schemas.WorkerResponse])
def get_workers(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of workers, optionally filtered."""
    query = db.query(models.Worker).filter(models.Worker.is_active == True)
    if category:
        query = query.filter(models.Worker.category == category)
    if city:
        query = query.filter(models.Worker.city.ilike(f"%{city}%"))
    if district:
        query = query.filter(models.Worker.address.ilike(f"%{district}%"))
    
    # Order by rating descending by default
    workers = query.order_by(desc(models.Worker.avg_rating)).offset(skip).limit(limit).all()
    return workers

@router.get("/{worker_id}", response_model=schemas.WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a specific worker by ID."""
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.post("/", response_model=schemas.WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(
    worker: schemas.WorkerCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Create a new worker (Admin only)."""
    db_worker = models.Worker(**worker.dict(), added_by=current_user.id)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.put("/{worker_id}", response_model=schemas.WorkerResponse)
def update_worker(
    worker_id: int, 
    worker_update: schemas.WorkerUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Update a worker (Admin only)."""
    db_worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    update_data = worker_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_worker, key, value)
    
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.post("/{worker_id}/reviews", response_model=schemas.ReviewResponse)
def create_review(
    worker_id: int,
    review: schemas.ReviewBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Add a review and rating for a worker."""
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Check if user already reviewed
    existing_review = db.query(models.Review).filter(
        models.Review.worker_id == worker_id,
        models.Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this worker")
        
    new_review = models.Review(
        **review.dict(),
        worker_id=worker_id,
        user_id=current_user.id
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Update worker's average rating
    all_reviews = db.query(models.Review).filter(models.Review.worker_id == worker_id).all()
    total_rating = sum(r.rating for r in all_reviews)
    worker.total_reviews = len(all_reviews)
    worker.avg_rating = total_rating / len(all_reviews) if len(all_reviews) > 0 else 0
    db.commit()
    
    return new_review

@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Delete a worker (Admin only)."""
    db_worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    db.delete(db_worker)
    db.commit()
    return None

@router.get("/{worker_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_worker_reviews(worker_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get reviews for a specific worker."""
    reviews = db.query(models.Review).filter(
        models.Review.worker_id == worker_id
    ).order_by(desc(models.Review.created_at)).offset(skip).limit(limit).all()
    return reviews
