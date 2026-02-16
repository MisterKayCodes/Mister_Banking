from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.transaction_service import create_transaction, reverse_transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse)
def create_new_transaction(tx: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(db, tx)

@router.post("/reverse/{tx_id}", response_model=TransactionResponse)
def reverse_existing_transaction(tx_id: int, db: Session = Depends(get_db)):
    return reverse_transaction(db, tx_id)
