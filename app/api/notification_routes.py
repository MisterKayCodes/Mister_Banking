from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.data.database import SessionLocal
from app.models.notification import Notification
from app.api.auth_routes import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationRead  # ## Mister, our new contract!

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[NotificationRead])
def get_my_notifications(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Fetch all alerts for the logged-in citizen, newest first."""
    # ## Mister, because of 'from_attributes = True' in the schema, 
    # ## we can return the SQLAlchemy objects directly!
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

@router.put("/{notification_id}/read", response_model=dict)
def mark_as_read(
    notification_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read so it stops blinking in React."""
    # ## Mister, we strictly filter by user_id to prevent "Peeking" or unauthorized edits.
    notif = db.query(Notification).filter(
        Notification.id == notification_id, 
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
        
    notif.is_read = True
    db.commit()
    return {"status": "success", "message": "Notification read, Mister."}

@router.delete("/clear-all")
def clear_notifications(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Mister, sometimes a citizen wants a fresh start. This wipes their tray."""
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()
    return {"status": "success", "message": "All notifications cleared."}