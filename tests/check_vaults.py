import sys
import os

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.getcwd())

from app.data.database import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet
from app.models.notification import Notification
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.support import SupportMessage
from app.models.system_config import SystemConfig

def check_db_integrity():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total Citizens: {len(users)}")
        
        for user in users:
            # Refresh to ensure relationships are loaded
            db.refresh(user)
            accounts = user.accounts
            wallet = user.wallet
            
            print(f"Citizen: {user.full_name} ({user.email})")
            print(f"  - Bank Accounts: {len(accounts)}")
            for acc in accounts:
                print(f"    * {acc.account_number} ({acc.currency}): {acc.balance}")
            print(f"  - Crypto Vault: {'ACTIVE' if wallet else 'MISSING'}")
            if wallet:
                print(f"    * BTC: {wallet.btc_balance}")
                print(f"    * USDT: {wallet.usdt_balance}")
            
            if not accounts or not wallet:
                print("  !! ALERT: This citizen has an incomplete vault system.")
                
    finally:
        db.close()

if __name__ == "__main__":
    check_db_integrity()
