from sqlalchemy.orm import Session
from app.models.support import SupportMessage

def send_support_message(db: Session, user_id: int, subject: str, message: str, is_admin: bool = False):
    # This handles both user inquiries and admin replies
    new_msg = SupportMessage(
        user_id=user_id,
        subject=subject,
        message=message,
        is_from_admin=is_admin
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

def get_user_support_history(db: Session, user_id: int):
    # This pulls the full chat history for the user
    return db.query(SupportMessage).filter(SupportMessage.user_id == user_id).order_by(SupportMessage.created_at.asc()).all()

def get_all_admin_messages(db: Session):
    # Admin view of all incoming support requests
    return db.query(SupportMessage).filter(SupportMessage.is_from_admin == False).order_by(SupportMessage.created_at.desc()).all()