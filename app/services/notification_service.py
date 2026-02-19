from sqlalchemy.orm import Session
from app.models.notification import Notification

def send_notification(db: Session, user_id: int, title: str, message: str, n_type: str = "info"):
    """Mister's megaphone: Logs a message for the user to see in React."""
    new_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=n_type
    )
    db.add(new_notif)
    db.commit()
    # No need to refresh, we just fire and forget, Mister.