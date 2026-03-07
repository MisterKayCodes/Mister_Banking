import sys
import os
sys.path.append(os.getcwd())
from app.data.database import SessionLocal
from app.models.user import User
from app.models.account import Account

def check_admin_accounts():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@gmail.com").first()
    if admin:
        print(f"Admin Found: ID={admin.id}")
        accounts = db.query(Account).filter(Account.user_id == admin.id).all()
        print(f"Accounts in DB for Admin: {len(accounts)}")
        for acc in accounts:
            print(f"  - No: {acc.account_number}, Bal: {acc.balance}, Active: {acc.is_active}")
    else:
        print("Admin user NOT found.")
    db.close()

if __name__ == "__main__":
    check_admin_accounts()
