"""Transaction endpoints: transfers, crypto purchases, receipts."""
from fastapi import APIRouter, Depends, Query, HTTPException
from decimal import Decimal
from sqlalchemy.orm import Session
from typing import List, Optional
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import (
    TransactionCreate, TransactionResponse, TransactionReceipt, BuyCryptoRequest,
)
from app.services.transaction_service import (
    create_transaction, get_transaction_receipt, buy_crypto,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse)
def create_new_transaction(data: TransactionCreate, db: Session = Depends(get_db),
                            current_user=Depends(get_current_user)):
    
    # ## LOGIC UPGRADE: Speed Control
    # ## Mister, the service handles the 'pending' status based on TransferType, 
    # ## but your $5000 rule adds an extra layer of protection.
    
    # Note: Our new service logic handles the status internally, 
    # but we pass the data object directly as the service expects.
    return create_transaction(db, user_id=current_user.id, data=data)

@router.post("/buy-crypto", response_model=TransactionResponse)
def purchase_crypto(data: BuyCryptoRequest, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    # ## Fix: Using the correct field names from your BuyCryptoRequest schema
    return buy_crypto(
        db, 
        current_user.id, 
        data.account_no, 
        data.amount_usdt, 
        data.crypto_symbol
    )

@router.get("/{tx_id}/receipt", response_model=TransactionReceipt)
def get_receipt(tx_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    return get_transaction_receipt(db, tx_id, current_user.id)

@router.get("/lookup/{account_no}", response_model=dict)
def lookup_receiver(account_no: str, db: Session = Depends(get_db), 
                    current_user=Depends(get_current_user)):
    # ## Mister, the 'Security Handshake'
    from app.services.transaction_service import _get_account_by_number
    
    account = _get_account_by_number(db, account_no)
    return {
        "account_no": account.account_number,
        "receiver_name": account.user.full_name,
        "currency": account.currency
    }