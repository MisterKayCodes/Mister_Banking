from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.account import Account
from app.schemas.transaction import TransactionCreate

def create_transaction(db: Session, tx_data: TransactionCreate):
    # Simple validation
    sender = db.query(Account).filter(Account.id == tx_data.sender_account_id).first()
    receiver = db.query(Account).filter(Account.id == tx_data.receiver_account_id).first()

    if not sender or not receiver:
        raise ValueError("Sender or receiver account not found")

    if sender.balance < tx_data.amount + tx_data.fee:
        raise ValueError("Insufficient balance")

    sender.balance -= (tx_data.amount + tx_data.fee)
    receiver.balance += tx_data.amount

    transaction = Transaction(**tx_data.dict(), status="success")
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction

def reverse_transaction(db: Session, tx_id: int):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx or not tx.is_reversible:
        raise ValueError("Transaction cannot be reversed")

    sender = db.query(Account).filter(Account.id == tx.sender_account_id).first()
    receiver = db.query(Account).filter(Account.id == tx.receiver_account_id).first()

    receiver.balance -= tx.amount
    sender.balance += (tx.amount + tx.fee)

    tx.status = "reversed"
    db.commit()
    db.refresh(tx)
    return tx
