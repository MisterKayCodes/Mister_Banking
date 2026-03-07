from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from decimal import Decimal
from datetime import datetime
import uuid
from typing import Dict, Any

from app.models.account import Account
from app.models.transaction import Transaction
from app.models.system_config import SystemConfig
from app.models.audit_log import AuditLog
from app.models.user import User
from app.core.security import hash_password # Added security

# -------------------- UTILITY FUNCTIONS --------------------

def log_audit(db: Session, action: str, admin_id: int = None):
    # ## Manual audit entry for immediate logging.
    audit = AuditLog(admin_id=admin_id, action=action)
    db.add(audit)
    db.commit()

def background_log_audit(action: str, admin_id: int = None):
    # ## This ensures the session lives long enough to record your actions
    # ## without crashing the system.
    from app.data.database import SessionLocal
    with SessionLocal() as db:
        log_audit(db, action, admin_id)

def get_system_config_value(db: Session, key: str, default=None):
    # ## Fast lookup for system rules.
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if config:
        return config.value
    if default is not None:
        return default
    raise HTTPException(status_code=404, detail=f"Config '{key}' not found.")

def toggle_system_maintenance(db: Session, enabled: bool, background_tasks: BackgroundTasks, admin_id: int = None):
    # ## The Kill-Switch logic. Shuts down the bank for everyone but you.
    cfg = db.query(SystemConfig).filter(SystemConfig.key == "maintenance_mode").first()
    if not cfg:
        db.add(SystemConfig(key="maintenance_mode", value=str(enabled)))
    else:
        cfg.value = str(enabled)
    db.commit()

    background_tasks.add_task(background_log_audit, f"System Maintenance set to {enabled}", admin_id)
    return {"maintenance_mode": enabled}

# -------------------- ACCOUNT CONTROL --------------------

def set_account_active(db: Session, account_id: int, is_active: bool, background_tasks: BackgroundTasks, admin_id: int = None):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    account.is_active = is_active
    db.commit()

    action = f"Set account {account.id} active={is_active}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "account_id": account.id, "active": is_active}

def toggle_trading_block(db: Session, user_id: int, blocked: bool, reason: str, background_tasks: BackgroundTasks, admin_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.trading_blocked = blocked
    user.trading_block_reason = reason if blocked else None
    db.commit()

    action = f"TRADING BLOCK: User {user.id} set to {blocked}. Reason: {reason}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "user_id": user.id, "trading_blocked": blocked, "reason": reason}

def delete_account_permanently(db: Session, account_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    db.delete(account)
    db.commit()

    action = f"Permanently DELETED account {account_id}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "message": f"Account {account_id} wiped."}

def update_account_balance(db: Session, account_id: int, new_balance: Decimal, 
                           background_tasks: BackgroundTasks, admin_id: int = None, stealth: bool = False):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    old_balance = account.balance
    account.balance = new_balance
    db.commit()
    db.refresh(account)

    action = f"BALANCE CHANGE: Acc {account.id} ({old_balance} -> {new_balance})"
    if stealth:
        action = f"STEALTH {action}"
    
    background_tasks.add_task(background_log_audit, action, admin_id)
    return account

# -------------------- TRANSACTION CONTROL --------------------

def approve_transaction(db: Session, tx_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx or tx.status != "pending":
        raise HTTPException(status_code=400, detail="Transaction not in pending state.")

    # ## Money movement logic
    receiver = db.query(Account).filter(Account.id == tx.receiver_account_id).first()
    if receiver:
        receiver.balance += tx.amount
    
    tx.status = "success"
    tx.completed_at = datetime.utcnow()
    db.commit()
    
    background_tasks.add_task(background_log_audit, f"Approved Tx {tx_id}", admin_id)
    return tx

def block_transaction(db: Session, tx_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if tx.status in ["reversed", "blocked"]:
        raise HTTPException(status_code=400, detail="Transaction cannot be blocked.")

    tx.status = "blocked"
    db.commit()
    db.refresh(tx)

    background_tasks.add_task(background_log_audit, f"Blocked transaction {tx.id}", admin_id)
    return tx


def delete_transaction_permanently(db: Session, tx_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    # History adjustment: Permanent record removal.
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(tx)
    db.commit()

    action = f"Permanently DELETED transaction {tx_id}"
    background_tasks.add_task(background_log_audit, action, admin_id)

    return {"status": "success", "message": f"Transaction {tx_id} erased."}
# -------------------- SYSTEM SETTINGS --------------------

def get_settings(db: Session):
    configs = db.query(SystemConfig).all()
    result = {}
    for cfg in configs:
        try:
            val = Decimal(cfg.value)
        except:
            val = cfg.value
        result[cfg.key] = val
    return result

def update_fees(db: Session, transfer_fee: Decimal, instant_fee: Decimal, background_tasks: BackgroundTasks, admin_id: int = None):
    for key, value in {"transfer_fee_percent": transfer_fee, "instant_transfer_fee_percent": instant_fee}.items():
        cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if not cfg:
            db.add(SystemConfig(key=key, value=str(value)))
        else:
            cfg.value = str(value)
    db.commit()

    background_tasks.add_task(background_log_audit, f"Fees updated to {transfer_fee}%/{instant_fee}%.", admin_id)
    return {"status": "success", "message": "New fees are live."}


# -------------------- ULTIMATE AUTHORITY POWERS --------------------

def execute_nuclear_user_wipe(db: Session, user_id: int, admin_id: int):
    """Execution of total digital identity erasure."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    try:
        user_accounts = db.query(Account).filter(Account.user_id == user_id).all()
        account_ids = [acc.id for acc in user_accounts]

        if account_ids:
            # 1. Scrub Transaction history
            db.query(Transaction).filter(
                (Transaction.sender_account_id.in_(account_ids)) | 
                (Transaction.receiver_account_id.in_(account_ids))
            ).delete(synchronize_session=False)

            # 2. Wiping Fiat Accounts
            db.query(Account).filter(Account.user_id == user_id).delete(synchronize_session=False)

        # 3. Wipe the Crypto Vault
        from app.models.wallet import Wallet
        db.query(Wallet).filter(Wallet.user_id == user_id).delete(synchronize_session=False)

        # 4. Delete the User
        db.delete(user)
        log_audit(db, f"NUCLEAR WIPE: User {user_id} and all vaults purged.", admin_id)
        db.commit()
        return {"status": "success", "message": f"User {user_id} has been wiped from the timeline."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Strike aborted: {str(e)}")

# -------------------- USER & LEDGER OVERVIEW --------------------

def get_all_users_master_list(db: Session):
    """Master ledger retrieval. Formatted for administrative review."""
    from app.models.wallet import Wallet
    
    results = db.query(User, Account, Wallet).outerjoin(
        Account, User.id == Account.user_id
    ).outerjoin(
        Wallet, User.id == Wallet.user_id
    ).all()

    master_ledger = []
    for user, account, wallet in results:
        # Standardized formatting for administrative dashboard.
        fiat = f"{account.balance:,.2f} {account.currency}" if account else "0.00 USD"
        btc = f"{wallet.btc_balance:0.8f} BTC" if wallet else "0.00000000 BTC"
        usdt = f"{wallet.usdt_balance:0.2f} USDT" if wallet else "0.00 USDT"

        master_ledger.append({
            "user_id": user.id,
            "name": user.full_name,
            "email": user.email,
            "date_of_birth": user.date_of_birth or "N/A",
            "verification": user.kyc_status,
            "status": "Active" if user.is_active else "Suspended",
            "fiat_balance": fiat,
            "btc_balance": btc,
            "usdt_vault": usdt
        })
    return master_ledger

# -------------------- PROFILE MANIPULATION --------------------

def update_user_profile_admin(db: Session, user_id: int, update_data: Dict[str, Any], background_tasks: BackgroundTasks, admin_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    account = db.query(Account).filter(Account.user_id == user_id).first()

    for key, value in update_data.items():
        if key == "password" and value:
            # ## Security first: We hash the password before saving!
            user.hashed_password = hash_password(value)
        elif hasattr(user, key):
            setattr(user, key, value)
        elif account and hasattr(account, key):
            setattr(account, key, value)

    db.commit()
    
    action = f"ADMIN EDIT: User {user_id} profile/account modified by Admin {admin_id}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "message": f"User {user_id} records updated."}

# -------------------- MANUAL DEPOSITS --------------------

def admin_manual_fiat_deposit(db: Session, account_id: int, amount: Decimal, tag: str, background_tasks: BackgroundTasks, admin_id: int):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    # Apply balance increase
    account.balance += amount
    
    # Create a record for the user to see
    new_tx = Transaction(
        reference=str(uuid.uuid4()),
        sender_account_id=account.id, # System source uses same account ID to satisfy FK constraint
        sender_no="SYSTEM_DEPOSIT",
        receiver_account_id=account.id,
        receiver_no=account.account_number,
        amount=amount,
        status="success",
        details=tag,
        completed_at=datetime.utcnow()
    )
    db.add(new_tx)
    db.commit()

    action = f"MANUAL FIAT DEPOSIT: {amount} {account.currency} to Acc {account.id} with tag: {tag}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "message": f"Deposited {amount} {account.currency} successfully."}

def admin_manual_crypto_deposit(db: Session, user_id: int, coin: str, amount: float, tag: str, background_tasks: BackgroundTasks, admin_id: int):
    from app.models.wallet import Wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")

    if coin.lower() == "btc":
        wallet.btc_balance += Decimal(str(amount))
    elif coin.lower() == "usdt":
        wallet.usdt_balance += Decimal(str(amount))
    else:
        raise HTTPException(status_code=400, detail="Invalid currency choice.")

    db.commit()

    # Create an institutional ledger record for the transaction history
    from app.models.account import Account
    linked_account = db.query(Account).filter(Account.user_id == user_id).first()
    if linked_account:
        new_tx = Transaction(
            reference=str(uuid.uuid4()),
            sender_account_id=linked_account.id, 
            sender_no="SYSTEM_CRYPTO",
            receiver_account_id=linked_account.id,
            receiver_no=wallet.btc_address if coin.lower() == 'btc' else wallet.usdt_address,
            amount=amount,
            currency=coin.upper(),
            status="success",
            details=f"Institutional Vault Deposit: {tag}",
            completed_at=datetime.utcnow(),
            transfer_type="crypto_injection"
        )
        db.add(new_tx)
        db.commit()
    action = f"MANUAL CRYPTO DEPOSIT: {amount} {coin.upper()} to User {user_id} with tag: {tag}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "message": f"Deposited {amount} {coin.upper()} successfully."}
