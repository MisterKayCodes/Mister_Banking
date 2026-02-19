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
from app.core.security import verify_password, hash_password
from app.services.notification_service import send_notification
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
    """
    Mister, this is the main engine. It now requires a PIN and sends 
    a receipt to the user's notification tray automatically.
    """
    # ## 0. THE SECURITY GATE
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found, Mister.")

    # ## -------------------- #COPY: PIN VERIFICATION --------------------
    if not user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set, Mister.")
    
    if not verify_password(data.pin, user.pin_hash):
        # Notify user of a failed attempt for security
        send_notification(
            db, user_id, 
            title="Security Alert", 
            message="A transaction was attempted with an incorrect PIN.", 
            n_type="warning"
        )
        raise HTTPException(status_code=403, detail="Invalid PIN. Access denied.")
    # ## -----------------------------------------------------------------

    # ## 1. Fetch sender and check ownership
    sender = db.query(Account).filter(Account.account_number == data.from_account_no).first()
    if not sender or sender.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch or account missing.")
    
    # ## 2. MISTER'S LIMIT CHECK
    limit_key = "verified_transaction_limit" if user.kyc_status == "verified" else "unverified_transaction_limit"
    current_limit = Decimal(str(get_config_float(db, limit_key)))

    if data.amount > current_limit:
        raise HTTPException(status_code=400, detail=f"Limit exceeded. Max: ${current_limit}")

    # ## 3. Fee & Balance Check
    fee_percent = Decimal(str(get_config_float(db, "transfer_fee_percent")))
    fee = (data.amount * fee_percent) / 100
    total_deduction = data.amount + fee

    if sender.balance < total_deduction:
        raise HTTPException(status_code=400, detail="Insufficient funds for amount + fees.")

    # ## 4. Execution
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
        receiver = db.query(Account).filter(Account.account_number == data.to_account_no).first()
        if not receiver or sender.id == receiver.id:
            raise HTTPException(status_code=400, detail="Invalid receiver account.")
        
        sender.balance -= total_deduction
        receiver.balance += data.amount
        new_tx.receiver_account_id = receiver.id
        new_tx.receiver_no = receiver.account_number
        new_tx.status = "success"
        new_tx.completed_at = now
        
        # #COPY: Notify the receiver too!
        send_notification(
            db, receiver.user_id, 
            title="Credit Alert", 
            message=f"You received ${data.amount} from {user.full_name}.", 
            n_type="success"
        )
    else:
        # External Transfer (Wire)
        sender.balance -= total_deduction
        new_tx.status = "pending"
        new_tx.receiver_no = data.external_account_no
        new_tx.external_bank_name = data.external_bank_name

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # #COPY: Notify the sender of success
    send_notification(
        db, user_id, 
        title="Transaction Successful", 
        message=f"Sent ${data.amount} to {new_tx.receiver_no}. Fee: ${fee}.", 
        n_type="info"
    )

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

