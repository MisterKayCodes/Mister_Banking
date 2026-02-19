from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def create_user(db: Session, user_data: UserCreate):
    # ## Mister's User Creation - We don't just take the email, we lock it down.
    # ## We pull the password from user_data and hash it immediately.
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    # ## Adding the new player to the ledger.
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session):
    # ## Getting a full roll call of everyone in the system.
    return db.query(User).all()

def get_user_by_email(db: Session, email: str):
    # ## Quick lookup to see if this Mister already has an account.
    return db.query(User).filter(User.email == email).first()