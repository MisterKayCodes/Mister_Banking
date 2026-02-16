from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.schemas.account import AccountCreate, AccountResponse
from app.services.account_service import create_account, get_account, get_user_accounts

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("/", response_model=AccountResponse)
def create_new_account(account: AccountCreate, db: Session = Depends(get_db)):
    return create_account(db, account)

@router.get("/{account_id}", response_model=AccountResponse)
def read_account(account_id: int, db: Session = Depends(get_db)):
    return get_account(db, account_id)

@router.get("/user/{user_id}", response_model=list[AccountResponse])
def read_user_accounts(user_id: int, db: Session = Depends(get_db)):
    return get_user_accounts(db, user_id)
