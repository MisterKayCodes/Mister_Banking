import asyncio
from app.data.database import SessionLocal
from app.models.user import User

def fix_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == 'admin@gmail.com').first()
    if admin and "Mister" in admin.full_name:
        admin.full_name = "System Administrator"
        db.commit()
    db.close()

if __name__ == "__main__":
    fix_admin()
