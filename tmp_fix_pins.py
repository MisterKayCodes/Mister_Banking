import sys
import os

# Add the project root to the path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.data.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def fix_missing_pins():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.pin_hash == None).all()
        for user in users:
            user.pin_hash = hash_password("123456")
        db.commit()
        print(f"Fixed {len(users)} users. PIN set to 123456.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_missing_pins()
