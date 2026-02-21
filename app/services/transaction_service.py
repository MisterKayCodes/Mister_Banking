from decimal import Decimal
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks

# Core Imports
from app.core.crypto import get_live_btc_price
from app.core.security import verify_password
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.user import User

# Service Imports
from app.services.config_service import get_config_float, get_config_int
from app.services.notification_service import send_notification
# ## MISTER: Make sure this path to admin_service is correct!
from app.services.admin_service import get_system_config_value, background_log_audit

# Schema Imports
from app.schemas.transaction import TransactionCreate, TransferType
from app.schemas.wallet import CryptoTradeRequest

# -------------------- MISTER'S PRIVATE HELPERS --------------------

def _check_kyc_approval(db: Session, user_id: int) -> User:
    # ## Mister, the gatekeeper function is now dual-purpose.
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

def _get_account_by_number(db: Session, account_number: str, active_only: bool = True) -> Account:
    # ## Identity lookup via the 10-digit ledger ID.
    account = db.query(Account).filter(Account.account_number == account_number).first()
    if not account:
        raise HTTPException(status_code=404, detail=f"Account {account_number} not found.")
    if active_only and not account.is_active:
        raise HTTPException(status_code=400, detail="This account is currently suspended, Mister.")
    return account

# -------------------- CORE TRANSACTION LOGIC --------------------

def create_transaction(db: Session, user_id: int, data: TransactionCreate):
    # ## 0. THE SECURITY GATE (PIN Verification)
    user = _check_kyc_approval(db, user_id)
    if not user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set, Mister.")
    
    if not verify_password(data.pin, user.pin_hash):
        send_notification(db, user_id, title="Security Alert", message="Incorrect PIN attempt.", n_type="warning")
        raise HTTPException(status_code=403, detail="Invalid PIN. Access denied.")

    # ## 1. OWNERSHIP & LIMITS
    sender = _get_account_by_number(db, data.from_account_no)
    if sender.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch.")
    
    limit_key = "verified_transaction_limit" if user.kyc_status == "verified" else "unverified_transaction_limit"
    current_limit = Decimal(str(get_config_float(db, limit_key)))

    if data.amount > current_limit:
        raise HTTPException(status_code=400, detail=f"Limit exceeded. Max: ${current_limit}")

    # ## 2. FEES & BALANCE
    fee_percent = Decimal(str(get_config_float(db, "transfer_fee_percent")))
    fee = (data.amount * fee_percent) / 100
    total_deduction = data.amount + fee

    if sender.balance < total_deduction:
        raise HTTPException(status_code=400, detail="Insufficient funds for amount + fees.")

    # ## 3. EXECUTION
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
        receiver = _get_account_by_number(db, data.to_account_no)
        if sender.id == receiver.id:
            raise HTTPException(status_code=400, detail="Cannot send money to the same account.")
        
        sender.balance -= total_deduction
        receiver.balance += data.amount
        new_tx.receiver_account_id = receiver.id
        new_tx.receiver_no = receiver.account_number
        new_tx.status = "success"
        new_tx.completed_at = now
        
        send_notification(db, receiver.user_id, title="Credit Alert", message=f"Received ${data.amount} from {user.full_name}.", n_type="success")
    else:
        sender.balance -= total_deduction
        new_tx.status = "pending"
        new_tx.receiver_no = data.external_account_no
        new_tx.external_bank_name = data.external_bank_name

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    send_notification(db, user_id, title="Transaction Successful", message=f"Sent ${data.amount} to {new_tx.receiver_no}.", n_type="info")
    return new_tx

# -------------------- CRYPTO & ADMIN POWERS --------------------

def execute_crypto_trade(db: Session, user_id: int, data: CryptoTradeRequest, background_tasks: BackgroundTasks):
    # ## 1. ADMIN OVERRIDE
    is_active = get_system_config_value(db, "crypto_trading_enabled", default="true")
    if is_active.lower() != "true":
        raise HTTPException(status_code=403, detail="Mister, the crypto markets are currently frozen by the Founder.")

    # ## 2. ACCESS CHECK
    user = _check_kyc_approval(db, user_id)
    if user.kyc_status != "verified":
        raise HTTPException(status_code=403, detail="The Crypto Vault requires a 'verified' status, Mister.")

    account = _get_account_by_number(db, data.account_no)
    if account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch.")

    if not user.wallet:
        raise HTTPException(status_code=400, detail="Mister, this citizen does not have a wallet initialized.")

    # ## 3. MATH & PRICING
    fee_pct_str = get_system_config_value(db, "crypto_trade_fee_percent", default="0.5")
    fee_percent = Decimal(fee_pct_str)
    fee_usd = (data.amount_usd * fee_percent) / 100
    trade_value_usd = data.amount_usd - fee_usd 

    price = get_live_btc_price() if data.crypto_symbol.upper() == "BTC" else Decimal("1.00")
    crypto_quantity = trade_value_usd / price

    # ## 4. EXECUTION
    if data.side == "buy":
        if account.balance < data.amount_usd:
            raise HTTPException(status_code=400, detail="Insufficient bank balance.")
        account.balance -= data.amount_usd
        if data.crypto_symbol.upper() == "BTC":
            user.wallet.btc_balance += crypto_quantity
        else:
            user.wallet.usdt_balance += crypto_quantity
    elif data.side == "sell":
        curr_bal = user.wallet.btc_balance if data.crypto_symbol.upper() == "BTC" else user.wallet.usdt_balance
        required_crypto = data.amount_usd / price 
        if curr_bal < required_crypto:
             raise HTTPException(status_code=400, detail="Insufficient crypto balance.")
        
        if data.crypto_symbol.upper() == "BTC":
            user.wallet.btc_balance -= required_crypto
        else:
            user.wallet.usdt_balance -= required_crypto
        account.balance += trade_value_usd

    # ## 5. COMMIT
    tx = Transaction(
        reference=str(uuid.uuid4()),
        sender_account_id=account.id,
        sender_no=account.account_number,
        amount=data.amount_usd,
        currency=data.crypto_symbol.upper(),
        status="success",
        details=f"CRYPTO {data.side.upper()}: {crypto_quantity:.8f} @ ${price}. Fee: ${fee_usd}",
        created_at=datetime.utcnow()
    )
    db.add(tx)
    db.commit()

    # ## 6. NOTIFY & AUDIT
    msg = f"Trade Successful! {data.side.upper()} {crypto_quantity:.8f} {data.crypto_symbol}."
    send_notification(db, user_id, title="Trade Confirmed", message=msg, n_type="success")
    
    background_tasks.add_task(background_log_audit, f"CRYPTO {data.side.upper()}: User {user_id} - ${data.amount_usd}")

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


