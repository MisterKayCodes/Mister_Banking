from decimal import Decimal
from datetime import datetime, timedelta
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.transaction import Transaction
from app.models.account import Account
from app.services.config_service import get_config_float, get_config_int
from app.schemas.transaction import TransactionCreate, TransferType
from app.models.user import User

# -------------------- MISTER'S PRIVATE HELPERS --------------------

def _check_kyc_approval(db: Session, user_id: int) -> User:
    # ## Mister, the name stays the same, but now it carries a gift (the user data).
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # We still do the "verified" check for your existing security logic
    if user.kyc_status != "verified":
        # EXCEPT: If we want unverified users to have a $500 limit, 
        # we shouldn't 'raise' here anymore. We should check the limit later!
        pass 

    return user

def _get_account_by_number(db: Session, account_number: str, active_only: bool = True) -> Account:
    # ## Mister, we now look up by the 10-digit identity!
    account = db.query(Account).filter(Account.account_number == account_number).first()
    if not account:
        raise HTTPException(status_code=404, detail=f"Account {account_number} not found.")
    if active_only and not account.is_active:
        raise HTTPException(status_code=400, detail="Your account is inactive.")
    return account

# -------------------- CORE TRANSACTION LOGIC --------------------

def create_transaction(db: Session, user_id: int, data: TransactionCreate):
    # ## 0. THE GATE: Check status and get user details
    # Mister, this still ensures they are active, but now returns the user object.
    user = _check_kyc_approval(db, user_id)

    # ## 1. Fetch sender and check ownership
    sender = _get_account_by_number(db, data.from_account_no)
    if sender.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch, Mister.")
    
    # ## 2. MISTER'S LIMIT CHECK (THE NEW BRAKES)
    # We dynamically pull the limit based on whether they are 'verified' or not.
    limit_key = "verified_transaction_limit" if user.kyc_status == "verified" else "unverified_transaction_limit"
    current_limit = Decimal(str(get_config_float(db, limit_key)))

    if data.amount > current_limit:
        raise HTTPException(
            status_code=400, 
            detail=f"Mister says: Transaction limit exceeded. Your current limit is ${current_limit}."
        )

    # ## 3. Fee Calculation
    fee_percent = Decimal(str(get_config_float(db, "transfer_fee_percent")))
    fee = (data.amount * fee_percent) / 100
    total = data.amount + fee

    if sender.balance < total:
        raise HTTPException(status_code=400, detail="Insufficient funds for amount + fees.")

    # ## 4. Build the Transaction Record
    now = datetime.utcnow()
    new_tx = Transaction(
        reference=str(uuid.uuid4()),
        sender_account_id=sender.id,
        sender_no=sender.account_number,
        amount=data.amount,
        fee=fee,
        transfer_type=data.transfer_type,
        created_at=now
    )

    if data.transfer_type == TransferType.INTERNAL:
        # ## PATH A: Internal Logic (Instant)
        receiver = _get_account_by_number(db, data.to_account_no)
        if sender.id == receiver.id:
            raise HTTPException(status_code=400, detail="Self-transfer is a loop to nowhere.")
        
        sender.balance -= total
        receiver.balance += data.amount
        new_tx.receiver_account_id = receiver.id
        new_tx.receiver_no = receiver.account_number
        new_tx.status = "success"
        new_tx.completed_at = now
        
    else:
        # ## PATH B: External Logic (Overseas/Wire)
        # ## These stay PENDING for your manual approval, Mister.
        sender.balance -= total
        new_tx.receiver_no = data.external_account_no
        new_tx.status = "pending"
        
        # Mapping external banking details
        new_tx.external_bank_name = data.external_bank_name
        new_tx.external_swift_bic = data.external_swift_bic
        new_tx.external_iban_or_acc = data.external_account_no
        new_tx.recipient_full_name = data.recipient_full_name
        new_tx.purpose_of_transfer = data.purpose_of_transfer

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx    
# -------------------- CRYPTO & ADMIN POWERS --------------------

def buy_crypto(db: Session, user_id: int, account_no: str, amount_usdt: Decimal, crypto_symbol: str):
    # ## 0. THE GATE: Catch the user object here!
    user = _check_kyc_approval(db, user_id)
    
    # ## 1. THE STATUS CHECK: No verification, no crypto.
    if user.kyc_status != "verified":
        raise HTTPException(
            status_code=403, 
            detail="Mister says: The Crypto vault is for verified citizens only."
        )

    # ## 2. Fetch account and check ownership
    account = _get_account_by_number(db, account_no)
    if account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch.")

    # ## 3. Balance Check
    if account.balance < amount_usdt:
        raise HTTPException(status_code=400, detail="Not enough USDT in your vault.")

    # ## 4. Execute and Record
    account.balance -= amount_usdt
    tx = Transaction(
        reference=str(uuid.uuid4()),
        sender_account_id=account.id,
        sender_no=account.account_number,
        amount=amount_usdt,
        currency=crypto_symbol,
        status="success",
        details=f"Purchased {crypto_symbol}",
        created_at=datetime.utcnow()
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def get_all_transactions(db: Session, status: str = None):
    # ## The Admin's Eye
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    return query.all()

def get_transactions_for_account(db: Session, account_id: int):
    # ## Mister, this finds every move linked to this internal ID.
    # ## We keep this for the 'History' tab in the app.
    return db.query(Transaction).filter(
        (Transaction.sender_account_id == account_id) | 
        (Transaction.receiver_account_id == account_id)
    ).all()

# -------------------- LOOKUP & HISTORY RESTORED --------------------

def get_transaction_receipt(db: Session, tx_id: int, user_id: int):
    # ## Mister, we check ownership before showing the receipt. 
    # ## No one peeks at another citizen's business.
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # ## Verify if the user is either the sender or the receiver
    sender_account = db.query(Account).filter(Account.id == tx.sender_account_id).first()
    receiver_account = db.query(Account).filter(Account.id == tx.receiver_account_id).first()

    is_sender = sender_account and sender_account.user_id == user_id
    is_receiver = receiver_account and receiver_account.user_id == user_id

    if is_sender or is_receiver:
        return tx
        
    raise HTTPException(status_code=403, detail="Access denied to this receipt")

