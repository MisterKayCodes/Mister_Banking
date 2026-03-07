"""Account management service."""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.account import Account
from decimal import Decimal


def create_account(db: Session, user_id: int, currency: str = "USDT"):
    """Create a new account for a user."""
    # ## notice we don't pass account_number here.
    # ## Our Model's 'default=generate_account_number' handles the magic!
    account = Account(user_id=user_id, currency=currency)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_account(db: Session, account_id: int):
    """Get account by ID."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")
    return account


def get_user_accounts(db: Session, user_id: int):
    """Get all accounts for a user."""
    return db.query(Account).filter(Account.user_id == user_id).all()


def set_account_status(db: Session, account_id: int, is_active: bool):
    """Admin: activate or deactivate an account."""
    account = get_account(db, account_id)
    account.is_active = is_active
    db.commit()
    db.refresh(account)
    return account


def adjust_balance(db: Session, account_id: int, new_balance: Decimal):
    """Admin: manually adjust account balance."""
    account = get_account(db, account_id)
    account.balance = new_balance
    db.commit()
    db.refresh(account)
    return account
