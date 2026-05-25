import sys
import os

# Ensure the script can find the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.data.database import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.kyc import KYCSubmission
from app.models.notification import Notification
from app.models.support import SupportMessage
from app.core.security import hash_password

def inject_admin():
    db = SessionLocal()
    email = "admin@gmail.com"
    
    # Check if the user already exists in your local DB
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        print(f"User {email} found. Upgrading to Admin and resetting password to 'admin'...")
        existing_user.password_hash = hash_password("admin")
        existing_user.is_admin = True
        existing_user.is_active = True
    else:
        print(f"Creating brand new Admin: {email}...")
        new_admin = User(
            full_name="Super Admin",
            email=email,
            password_hash=hash_password("admin"),
            is_admin=True,
            is_active=True,
            kyc_status="verified"
        )
        db.add(new_admin)
    
    db.commit()
    db.close()
    print("\n✅ Success! You can now log into the local Admin Dashboard.")
    print("Email: admin@gmail.com")
    print("Password: admin")

if __name__ == "__main__":
    inject_admin()
