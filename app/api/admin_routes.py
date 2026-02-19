"""Admin endpoints: god-mode control over accounts, transactions, config, audit."""
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.core.security import get_admin_user
from app.schemas.admin import BalanceUpdate, AdminUserUpdate
from app.schemas.account import AccountResponse
from app.services.admin_service import (
    update_account_balance, delete_account_permanently, 
    delete_transaction_permanently, toggle_system_maintenance,
    execute_nuclear_user_wipe, get_all_users_master_list, update_user_profile_admin
)
from app.schemas.support import SupportMessageResponse, SupportReply
from app.services.support_service import get_all_admin_messages, send_support_message

from app.schemas.kyc import KYCRequirementCreate, KYCSubmissionUpdate # Import the KYC schemas
from app.services.kyc_service import (
    create_kyc_requirement, delete_kyc_requirement, review_kyc_submission
)

router = APIRouter(prefix="/admin", tags=["Admin"])

# -------------------- MASTER VIEW --------------------

@router.get("/users/master-ledger")
def view_all_citizens(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Mister, this is your Eye in the Sky. 
    It returns a full list of users, their statuses, and their 10-digit account numbers.
    """
    # ## Calling the service logic we built. 
    # ## Only an admin with a valid token can see this list.
    return get_all_users_master_list(db)

@router.patch("/users/{user_id}/edit-profile")
def admin_edit_user(user_id: int, 
                    data: AdminUserUpdate, # ## This tells Swagger what fields to show!
                    background_tasks: BackgroundTasks,
                    db: Session = Depends(get_db), 
                    admin=Depends(get_admin_user)):
    """
    Mister, the 'additionalProp1' is gone. 
    Use this to rewrite name, email, or account numbers directly.
    """
    # ## We turn your form into a dictionary, but we IGNORE anything you left blank.
    # ## This ensures we don't accidentally wipe data we didn't mean to touch.
    update_dict = data.model_dump(exclude_unset=True) 
    
    return update_user_profile_admin(db, user_id, update_dict, background_tasks, admin.id)

@router.patch("/accounts/{account_id}/stealth-balance", response_model=AccountResponse)
def stealth_balance_edit(account_id: int, data: BalanceUpdate,
                         background_tasks: BackgroundTasks, # ## Added this to match the service, Mister.
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

@router.post("/system/maintenance")
def set_maintenance(enabled: bool, 
                    background_tasks: BackgroundTasks,
                    db: Session = Depends(get_db), 
                    admin=Depends(get_admin_user)):
    return toggle_system_maintenance(db, enabled, background_tasks, admin.id)


@router.post("/system/broadcast")
def send_global_alert(title: str, message: str, n_type: str = "info", 
                      db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Mister, use this to send a message to EVERY user in the bank at once."""
    from app.models.user import User
    users = db.query(User).all()
    for user in users:
        send_notification(db, user_id=user.id, title=title, message=message, n_type=n_type)
    return {"status": "success", "message": f"Broadcast sent to {len(users)} citizens."}

@router.delete("/users/{user_id}/nuclear")
def nuclear_wipe_route(user_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You can't delete yourself. That's a paradox.")
    
    return execute_nuclear_user_wipe(db, user_id, admin.id)

# -------------------- SUPPORT COMMAND CENTER --------------------

@router.get("/support/inbox", response_model=List[SupportMessageResponse])
def view_support_inbox(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Mister, this pulls all messages sent by users that haven't been replied to yet.
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
    Mister, use this to send a message back to a citizen. 
    It will appear in their history with the 'is_from_admin' flag set to True.
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
    # ## Wipe a requirement and all user-uploaded evidence for it.
    return delete_kyc_requirement(db, req_id)

# ## -------------------- GOD-MODE VERDICT --------------------

@router.patch("/kyc/submissions/{sub_id}/review")
def fast_review(sub_id: int, status: str, comment: str = None, 
                db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    # 1. Execute the verdict in the database
    result = review_kyc_submission(db, sub_id, status, comment)
    
    # 2. MISTER'S PING: Tell the user the news!
    n_type = "success" if status == "approved" else "error"
    msg = f"Your KYC has been {status}. {comment if comment else ''}"
    
    send_notification(db, user_id=result.user_id, title="KYC Update", message=msg, n_type=n_type)
    
    return result

@router.get("/kyc/pending-approvals")
def view_pending_kyc(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """
    Mister, this pulls only the citizens who have 'pending' documents.
    It's your 'Morning To-Do List' for verification.
    """
    from app.models.kyc import KYCSubmission
    # ## We pull submissions and join the User and Requirement details for a full picture.
    return db.query(KYCSubmission).filter(KYCSubmission.status == "pending").all()