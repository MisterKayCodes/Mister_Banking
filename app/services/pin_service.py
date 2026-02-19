from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password


def set_pin(db: Session, user_id: int, pin: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    user.pin_hash = hash_password(pin)
    db.commit()
    return True


def verify_pin(db: Session, user_id: int, pin: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.pin_hash:
        return False

    return verify_password(pin, user.pin_hash)
