"""Admin endpoints: god-mode control over accounts, transactions, config, audit."""
from typing import List, Optional
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.core.security import get_admin_user
from app.models.wallet import Wallet
from app.schemas.admin import BalanceUpdate, AdminUserUpdate
from app.schemas.account import AccountResponse
from app.schemas.user import UserResponse, UserCreate
from app.services.notification_service import send_notification
from app.services.user_service import get_user_by_id
from app.services.admin_service import (
    get_all_users_master_list,
    update_user_profile_admin,
    toggle_trading_block,
    admin_manual_fiat_deposit,
    admin_manual_crypto_deposit,
    update_account_balance,
    delete_account_permanently, 
    delete_transaction_permanently,
    toggle_system_maintenance,
    execute_nuclear_user_wipe,
    generate_historical_ledger
)
from app.schemas.admin import BalanceUpdate, AdminUserUpdate, FiatDepositRequest, CryptoDepositRequest, AutoGenerateRequest
from app.schemas.support import SupportMessageResponse, SupportReply
from app.services.support_service import get_all_admin_messages, send_support_message

from app.schemas.kyc import KYCRequirementCreate, KYCSubmissionUpdate # Import the KYC schemas
from app.services.kyc_service import (
    create_kyc_requirement, delete_kyc_requirement, review_kyc_submission
)

router = APIRouter(prefix="/admin", tags=["Admin"])

# -------------------- MASTER VIEW --------------------

@router.get("/users/master-ledger")
def view_all_users(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Returns a full list of users, their statuses, and their 10-digit account numbers.
    """
    # ## Calling the service logic we built. 
    # ## Only an admin with a valid token can see this list.
    return get_all_users_master_list(db)

# ---------------------------------------------------------------------
# Promote/Demote a user to/from admin role
# ---------------------------------------------------------------------
@router.patch("/users/{user_id}/admin-status")
def admin_promote_route(user_id: int, data: AdminUserUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Toggle is_admin flag for a user. Only admins can call."""
    return admin_promote_user(db, user_id, data.is_admin, admin.id)

# ---------------------------------------------------------------------
# Verify/Unverify a user (KYC status)
# ---------------------------------------------------------------------
@router.patch("/users/{user_id}/verify-status")
def admin_verify_route(user_id: int, data: AdminUserUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Set kyc_status for a user (verified/pending/unverified)."""
    return admin_set_verification(db, user_id, data.kyc_status, admin.id)

# ---------------------------------------------------------------------
# Retrieve a single user's full profile (admin only)
# ---------------------------------------------------------------------
@router.get("/users/{user_id}", response_model=UserResponse)
def view_user_detail(user_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Return detailed info for a single user, including accounts and wallet."""
    return get_user_by_id(db, user_id)

@router.patch("/users/{user_id}/edit-profile")
def admin_edit_user(user_id: int, 
                    data: AdminUserUpdate, # ## This tells Swagger what fields to show!
                    background_tasks: BackgroundTasks,
                    db: Session = Depends(get_db), 
                    admin=Depends(get_admin_user)):
    """
    Update core user identity records: name, email, or account numbers.
    """
    # ## We turn your form into a dictionary, but we IGNORE anything you left blank.
    # ## This ensures we don't accidentally wipe data we didn't mean to touch.
    update_dict = data.model_dump(exclude_unset=True) 
    
    return update_user_profile_admin(db, user_id, update_dict, background_tasks, admin.id)

@router.patch("/accounts/{account_id}/stealth-balance", response_model=AccountResponse)
def stealth_balance_edit(account_id: int, data: BalanceUpdate,
                         background_tasks: BackgroundTasks,
                         db: Session = Depends(get_db),
                         admin=Depends(get_admin_user)):
    # ## The ghost edit. Invisible to the user, but noted in our logs.
    return update_account_balance(db, account_id, data.new_balance, background_tasks, admin_id=admin.id, stealth=True)

@router.delete("/accounts/{account_id}") # ## Removed 204 so you can see the success message.
def admin_delete_account(account_id: int, 
                         background_tasks: BackgroundTasks,
                         db: Session = Depends(get_db), 
                         admin=Depends(get_admin_user)):
    return delete_account_permanently(db, account_id, background_tasks, admin.id)

@router.delete("/transactions/{tx_id}")
def admin_delete_transaction(tx_id: int, 
                             background_tasks: BackgroundTasks,
                             db: Session = Depends(get_db), 
                             admin=Depends(get_admin_user)):
    return delete_transaction_permanently(db, tx_id, background_tasks, admin.id)

@router.get("/system/maintenance")
def get_maintenance_status(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.system_config import SystemConfig
    cfg = db.query(SystemConfig).filter(SystemConfig.key == "maintenance_mode").first()
    if cfg:
        return {"maintenance_mode": cfg.value.lower() == "true"}
    return {"maintenance_mode": False}

@router.post("/system/maintenance")
def set_maintenance(enabled: bool, 
                    background_tasks: BackgroundTasks,
                    db: Session = Depends(get_db), 
                    admin=Depends(get_admin_user)):
    return toggle_system_maintenance(db, enabled, background_tasks, admin.id)


@router.post("/system/broadcast")
def send_global_alert(title: str, message: str, n_type: str = "info", 
                      db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Transmits a message to every user in the system simultaneously."""
    from app.models.user import User
    users = db.query(User).all()
    for user in users:
        send_notification(db, user_id=user.id, title=title, message=message, n_type=n_type)
    return {"status": "success", "message": f"Broadcast sent to {len(users)} users."}

@router.delete("/users/{user_id}/nuclear")
def nuclear_wipe_route(user_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You can't delete yourself. That's a paradox.")
    
    return execute_nuclear_user_wipe(db, user_id, admin.id)

@router.post("/users/create", response_model=UserResponse)
def admin_create_user(data: UserCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Creates a new user account directly from the admin dashboard."""
    from app.services.auth_service import register_user
    return register_user(db, data.full_name, data.email, data.date_of_birth, data.password)

# -------------------- SUPPORT COMMAND CENTER --------------------

@router.get("/support/inbox", response_model=List[SupportMessageResponse])
def view_support_inbox(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Retrieves all incoming support messages that require a response.
    """
    # ## We use the service to filter for non-admin messages.
    return get_all_admin_messages(db)

@router.post("/support/{user_id}/reply", response_model=SupportMessageResponse)
def reply_to_user(
    user_id: int, 
    data: SupportReply, 
    db: Session = Depends(get_db), 
    admin=Depends(get_admin_user)
):
    """
    Appends an admin reply to the user's support history.
    """
    # ## We reuse the sender service but force 'is_admin=True'
    # ## The 'subject' is set to 'Admin Reply' to keep the thread clear.
    return send_support_message(
        db, 
        user_id=user_id, 
        subject="RE: Support Inquiry", 
        message=data.message, 
        is_admin=True
    )



# ## -------------------- DYNAMIC KYC RULES --------------------

@router.post("/kyc/rules")
def add_requirement(data: KYCRequirementCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    # ## Add a new doc type (e.g., 'Utility Bill') to the bank's laws.
    return create_kyc_requirement(db, **data.model_dump())

@router.delete("/kyc/rules/{req_id}")
def remove_requirement(req_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    # Delete a requirement and all associated evidence.
    return delete_kyc_requirement(db, req_id)

# ## -------------------- GOD-MODE VERDICT --------------------

# #COPY: UPDATED FUNCTION - FAST REVIEW
@router.patch("/kyc/submissions/{sub_id}/review")
def fast_review(sub_id: int, status: str, comment: str = None, 
                db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    # 1. Execute the verdict in the database
    result = review_kyc_submission(db, sub_id, status, comment)
    
    # Administrative notification transmission
    send_notification(db, user_id=result.user_id, title="KYC Update", message=msg, n_type=n_type)
    
    return result


@router.get("/kyc/pending-approvals")
def view_pending_kyc(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Retrieves all kyc submissions with 'pending' status for review.
    """
    from app.models.kyc import KYCSubmission
    # ## We pull submissions and join the User and Requirement details for a full picture.
    return db.query(KYCSubmission).filter(KYCSubmission.status == "pending").all()


# #COPY: NEW SECTION - CRYPTO WALLET CONTROL
# -------------------- CRYPTO WALLET CONTROL (NEW) --------------------

@router.patch("/wallets/{user_id}/edit-addresses")
def admin_edit_wallet_addresses(
    user_id: int, 
    btc_addr: Optional[str] = None, 
    usdt_addr: Optional[str] = None, 
    db: Session = Depends(get_db), 
    admin=Depends(get_admin_user)
):
    """
    Allows manual updates to BTC and USDT wallet addresses for a user.
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="No wallet found for this user.")
    
    if btc_addr: 
        wallet.btc_address = btc_addr
    if usdt_addr: 
        wallet.usdt_address = usdt_addr
    
    db.commit()
    return {"status": "success", "message": f"Addresses updated for user {user_id}."}

@router.get("/wallets/all")
def view_all_wallets(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Returns a unified ledger of all cryptocurrency wallets and their owners.
    """
    from app.models.user import User
    
    # Perform a joined load to include user identity details.
    results = db.query(Wallet).join(User).all()
    
    # We build a custom response so the frontend can display 'John Stones' next to his BTC.
    return [
        {
            "id": w.id,
            "user_id": w.user_id,
            "owner_name": w.user.full_name, # User relationship load
            "owner_email": w.user.email,
            "btc_address": w.btc_address,
            "usdt_address": w.usdt_address,
            "btc_balance": float(w.btc_balance),
            "usdt_balance": float(w.usdt_balance),
            "trading_blocked": w.user.trading_blocked,
            "created_at": w.created_at
        } for w in results
    ]

@router.post("/users/{user_id}/trade-block")
def admin_toggle_trade_block(user_id: int, blocked: bool, reason: str, 
                             background_tasks: BackgroundTasks,
                             db: Session = Depends(get_db), 
                             admin=Depends(get_admin_user)):
    """Suspends a user's access to the Cryptocurrency Exchange."""
    return toggle_trading_block(db, user_id, blocked, reason, background_tasks, admin.id)

# -------------------- MANUAL DEPOSITS --------------------

@router.post("/deposits/fiat")
def manual_fiat_deposit(data: FiatDepositRequest, background_tasks: BackgroundTasks,
                        db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Executes a manual fiat deposit and creates a transaction record for the user."""
    from decimal import Decimal
    return admin_manual_fiat_deposit(db, data.account_id, Decimal(str(data.amount)), data.tag, background_tasks, admin.id, data.custom_date, data.apply_to_balance)

@router.post("/deposits/crypto")
def manual_crypto_deposit(data: CryptoDepositRequest, background_tasks: BackgroundTasks,
                          db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Executes a manual crypto deposit into a user's BTC or USDT vault."""
    return admin_manual_crypto_deposit(db, data.user_id, data.coin, data.amount, data.tag, background_tasks, admin.id)

@router.post("/ledger/auto-generate")
def auto_generate_ledger(data: AutoGenerateRequest, background_tasks: BackgroundTasks,
                         db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Automatically generates a realistic historical transaction ledger for a given account."""
    return generate_historical_ledger(db, data, background_tasks, admin.id)