import os
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet
from app.models.notification import Notification
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.transaction import Transaction
from app.models.system_config import SystemConfig
from app.data.database import SessionLocal, engine

def test_app_db():
    print(f"Current Working Directory: {os.getcwd()}")
    print(f"Engine URL: {engine.url}")
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in the app's database.")
        for u in users:
            print(f"  - {u.email} ({u.full_name})")
    except Exception as e:
        print(f"Error querying users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_app_db()
