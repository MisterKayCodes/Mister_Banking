from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet
from app.models.notification import Notification
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.transaction import Transaction
from app.core.security import hash_password

DATABASE_URL = "sqlite:///./misterbanking.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if admin:
            admin.password_hash = hash_password("admin")
            db.commit()
            print("Admin password has been reset to 'admin' using the app's hashing logic.")
        else:
            print("Admin user not found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
