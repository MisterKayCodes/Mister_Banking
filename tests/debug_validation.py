import sys
import os
sys.path.append(os.getcwd())
from app.data.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserResponse
from sqlalchemy.orm import joinedload
import json
from decimal import Decimal

# Helper to handle Decimal in JSON
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

def debug_validation():
    db = SessionLocal()
    try:
        user = db.query(User).options(
            joinedload(User.accounts),
            joinedload(User.wallet)
        ).filter(User.id == 1).first()
        
        if not user:
            print("User 1 not found.")
            return

        print(f"Validating User: {user.full_name}")
        
        # Manually trigger Pydantic validation
        try:
            resp = UserResponse.model_validate(user)
            print("Validation SUCCESS.")
            print(json.dumps(resp.model_dump(), indent=2, cls=DecimalEncoder))
        except Exception as ve:
            print(f"Validation FAILURE:")
            print(ve)
            if hasattr(ve, 'errors'):
                print(json.dumps(ve.errors(), indent=2))
            
    finally:
        db.close()

if __name__ == "__main__":
    from app.models.account import Account
    from app.models.wallet import Wallet
    from app.models.notification import Notification
    from app.models.kyc import KYCRequirement, KYCSubmission
    from app.models.support import SupportMessage
    debug_validation()
