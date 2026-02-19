"""Account endpoints: create, view, list balances."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.account import AccountCreate, AccountResponse
from app.services.account_service import create_account, get_user_accounts, get_account

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("/", response_model=AccountResponse)
def create_new_account(data: AccountCreate, db: Session = Depends(get_db),
                       current_user=Depends(get_current_user)):
    """Create a new account for the authenticated user."""
    # ## Mister, this triggers the 10-digit generation we built!
    return create_account(db, current_user.id, data.currency)

@router.get("/", response_model=List[AccountResponse])
def list_my_accounts(db: Session = Depends(get_db),
                     current_user=Depends(get_current_user)):
    """
    Mister, this is the user's personal banking dashboard.
    It shows them their 10-digit number and exactly how much USDT they have.
    """
    # ## We use the service function to keep the code clean and professional.
    return get_user_accounts(db, current_user.id)

@router.get("/{account_id}", response_model=AccountResponse)
def read_account(account_id: int, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user)):
    """Get a specific account by ID."""
    account = get_account(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Vault not found, Mister.")
        
    # ## Security check: You can't peek into someone else's vault unless you're the Admin.
    if account.user_id != current_user.id and not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Access denied. This isn't your vault.")
    return account