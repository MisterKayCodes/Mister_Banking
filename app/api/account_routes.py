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
    # ## this triggers the 10-digit generation we built!
    return create_account(db, current_user.id, data.currency)

@router.get("/", response_model=List[AccountResponse])
def list_my_accounts(db: Session = Depends(get_db),
                     current_user=Depends(get_current_user)):
    """
    this is the user's personal banking dashboard.
    It shows them their 10-digit number and exactly how much USDT they have.
    """
    # ## We use the service function to keep the code clean and professional.
    accounts = get_user_accounts(db, current_user.id)
    
    # ## inject the wallet data for every account in the list!
    for acc in accounts:
        if acc.user:
            acc.owner_name = acc.user.full_name
            if acc.user.wallet:
                acc.btc_balance = acc.user.wallet.btc_balance
                acc.usdt_balance = acc.user.wallet.usdt_balance
                acc.btc_address = acc.user.wallet.btc_address
                acc.usdt_address = acc.user.wallet.usdt_address
                # If they have a wallet, this is effectively their 'Crypto' doorway.
                acc.type = "Crypto"
            
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
def read_account(account_id: int, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user)):
    """Get a specific account by ID."""
    account = get_account(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Vault not found.")
        
    # ## Strict Security: Nobody can peek into someone else's vault via this customer endpoint.
    if account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. This isn't your vault.")
        
    # ## we need to bridge the gap between the Account and the Crypto Wallet.
    # ## If a wallet exists for this user, we inject the data so the frontend sees it.
    if account.user:
        account.owner_name = account.user.full_name
        wallet = account.user.wallet
        if wallet:
            account.btc_balance = wallet.btc_balance
            account.usdt_balance = wallet.usdt_balance
            account.btc_address = wallet.btc_address
            account.usdt_address = wallet.usdt_address
            account.type = "Crypto"
            
    return account