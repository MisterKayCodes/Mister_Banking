"""User endpoints: profile, transaction history, customer support, and KYC."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.user import UserResponse
from app.schemas.transaction import TransactionResponse
from app.models.transaction import Transaction 
from app.services.account_service import get_user_accounts

# ## NEW: Mister, we bring in the support tools and KYC logic.
from app.schemas.support import SupportMessageCreate, SupportMessageResponse
from app.services.support_service import send_support_message, get_user_support_history
from app.schemas.kyc import (
    KYCRequirementResponse, KYCSubmissionResponse, 
    KYCSubmissionCreate, UserKYCStatus
)
from app.services.kyc_service import submit_kyc_document
from app.models.kyc import KYCRequirement, KYCSubmission

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_profile(current_user=Depends(get_current_user)):
    return current_user

# -------------------- FINANCIAL HISTORY --------------------

@router.get("/me/transactions", response_model=List[TransactionResponse])
def get_my_transactions(
    limit: int = Query(20, gt=0, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    accounts = get_user_accounts(db, current_user.id)
    if not accounts:
        return []

    account_ids = [acc.id for acc in accounts]
    query = db.query(Transaction).filter(
        (Transaction.sender_account_id.in_(account_ids)) | 
        (Transaction.receiver_account_id.in_(account_ids))
    ).order_by(Transaction.created_at.desc())

    return query.offset(offset).limit(limit).all()

# -------------------- IDENTITY VERIFICATION (KYC) --------------------

@router.get("/me/kyc/requirements", response_model=List[KYCRequirementResponse])
def get_kyc_rules(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Mister, this tells the user exactly what your bank demands.
    It's the shopping list for their verification folder.
    """
    return db.query(KYCRequirement).all()

@router.post("/me/kyc/submit", response_model=KYCSubmissionResponse)
def upload_kyc_proof(
    data: KYCSubmissionCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    """
    Mister, once they upload a file to your storage, 
    they send the link here to be judged.
    """
    return submit_kyc_document(
        db, 
        user_id=current_user.id, 
        requirement_id=data.requirement_id, 
        document_url=data.document_url
    )

@router.get("/me/kyc/status", response_model=UserKYCStatus)
def check_kyc_folder(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Mister, this shows them if they are 'verified' or if you 
    rejected a document with a specific comment.
    """
    submissions = db.query(KYCSubmission).filter(KYCSubmission.user_id == current_user.id).all()
    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "is_fully_verified": current_user.kyc_status == "verified",
        "submissions": submissions
    }

# -------------------- CUSTOMER SUPPORT --------------------

@router.post("/me/support", response_model=SupportMessageResponse)
def ask_for_help(
    data: SupportMessageCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    return send_support_message(
        db, 
        user_id=current_user.id, 
        subject=data.subject, 
        message=data.message, 
        is_admin=False
    )

@router.get("/me/support/history", response_model=List[SupportMessageResponse])
def get_my_support_chat(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    return get_user_support_history(db, user_id=current_user.id)