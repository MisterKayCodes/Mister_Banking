from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from decimal import Decimal
from datetime import datetime
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
    # ## without crashing the bank, Mister.
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
    raise HTTPException(status_code=404, detail=f"Config '{key}' not found, Mister.")

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
        raise HTTPException(status_code=404, detail="Account not found, Mister.")

    account.is_active = is_active
    db.commit()

    action = f"Set account {account.id} active={is_active}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "account_id": account.id, "active": is_active}

def delete_account_permanently(db: Session, account_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found, Mister.")

    db.delete(account)
    db.commit()

    action = f"Permanently DELETED account {account_id}"
    background_tasks.add_task(background_log_audit, action, admin_id)
    return {"status": "success", "message": f"Account {account_id} wiped."}

def update_account_balance(db: Session, account_id: int, new_balance: Decimal, 
                           background_tasks: BackgroundTasks, admin_id: int = None, stealth: bool = False):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found, Mister.")

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
        raise HTTPException(status_code=400, detail="Transaction not in pending state, Mister.")

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
        raise HTTPException(status_code=404, detail="Transaction not found, Mister.")
    if tx.status in ["reversed", "blocked"]:
        raise HTTPException(status_code=400, detail="Transaction cannot be blocked.")

    tx.status = "blocked"
    db.commit()
    db.refresh(tx)

    background_tasks.add_task(background_log_audit, f"Blocked transaction {tx.id}", admin_id)
    return tx


def delete_transaction_permanently(db: Session, tx_id: int, background_tasks: BackgroundTasks, admin_id: int = None):
    # ## Mister, this is the eraser. History is rewritten here.
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found, Mister.")

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

    background_tasks.add_task(background_log_audit, f"Fees updated to {transfer_fee}%/{instant_fee}%, Mister.", admin_id)
    return {"status": "success", "message": "New fees are live, Mister."}

# -------------------- ULTIMATE AUTHORITY POWERS --------------------

def execute_nuclear_user_wipe(db: Session, user_id: int, admin_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found in the ledger, Mister.")

    try:
        user_accounts = db.query(Account).filter(Account.user_id == user_id).all()
        account_ids = [acc.id for acc in user_accounts]

        if account_ids:
            # ## Scrubbing history
            db.query(Transaction).filter(
                (Transaction.sender_account_id.in_(account_ids)) | 
                (Transaction.receiver_account_id.in_(account_ids))
            ).delete(synchronize_session=False)

            # ## Wiping accounts
            db.query(Account).filter(Account.user_id == user_id).delete(synchronize_session=False)

        db.delete(user)
        log_audit(db, f"NUCLEAR WIPE: User {user_id} and all history purged, Mister.", admin_id)
        db.commit()
        return {"status": "success", "message": f"User {user_id} has been wiped from history."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Nuclear strike aborted: {str(e)}")

# -------------------- USER & LEDGER OVERVIEW --------------------

def get_all_users_master_list(db: Session):
    # ## Using outerjoin so users without accounts still show up in the Eye in the Sky.
    results = db.query(
        User.id, User.full_name, User.email, User.is_active.label("user_status"),
        Account.account_number, Account.balance, Account.currency
    ).outerjoin(Account, User.id == Account.user_id).all()

    master_ledger = []
    for row in results:
        master_ledger.append({
            "user_id": row.id,
            "name": row.full_name,
            "email": row.email,
            "status": "Active" if row.user_status else "Suspended",
            "account_number": row.account_number if row.account_number else "NO_ACCOUNT",
            "balance": f"{row.balance} {row.currency}" if row.account_number else "0.00"
        })
    return master_ledger

# -------------------- PROFILE MANIPULATION --------------------

def update_user_profile_admin(db: Session, user_id: int, update_data: Dict[str, Any], background_tasks: BackgroundTasks, admin_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found, Mister.")

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
    return {"status": "success", "message": f"User {user_id} rewritten in the ledger, Mister."}