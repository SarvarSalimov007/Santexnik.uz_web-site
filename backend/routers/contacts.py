"""Contact requests router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("/", response_model=schemas.ContactRequestResponse, status_code=status.HTTP_201_CREATED)
def create_contact_request(contact: schemas.ContactRequestCreate, db: Session = Depends(get_db)):
    """Create a new contact/callback request (public, no auth required)."""
    db_contact = models.ContactRequest(
        name=contact.name,
        phone=contact.phone,
        worker_id=contact.worker_id,
        category=contact.category,
        message=contact.message
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.get("/", response_model=List[schemas.ContactRequestResponse])
def get_contact_requests(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Get all contact requests (Admin only)."""
    contacts = db.query(models.ContactRequest).order_by(
        models.ContactRequest.created_at.desc()
    ).offset(skip).limit(limit).all()
    return contacts


@router.patch("/{contact_id}/process")
def mark_contact_processed(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Mark a contact request as processed (Admin only)."""
    contact = db.query(models.ContactRequest).filter(models.ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact request not found")
    contact.is_processed = True
    db.commit()
    return {"message": "Contact request marked as processed"}
