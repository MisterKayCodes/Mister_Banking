import os
import shutil
import uuid
from fastapi import APIRouter, Depends, Query, File, UploadFile, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.user import UserResponse
from app.schemas.transaction import TransactionResponse
from app.models.transaction import Transaction 
from app.services.account_service import get_user_accounts
from app.models.user import User

# ## NEW: Bringing in the support tools and KYC logic.
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
def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        # Reload the user with all their assets to ensure the frontend is updated correctly.
        user = db.query(User).options(
            joinedload(User.accounts),
            joinedload(User.wallet)
        ).filter(User.id == current_user.id).first()
        return user
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
    Returns the list of KYC requirements as defined by the institution.
    """
    return db.query(KYCRequirement).all()

@router.post("/me/kyc/submit", response_model=KYCSubmissionResponse)
def upload_kyc_proof(
    data: KYCSubmissionCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    """
    Submits a document URL for verification after it has been uploaded to storage.
    """
    return submit_kyc_document(
        db, 
        user_id=current_user.id, 
        requirement_id=data.requirement_id, 
        document_url=data.document_url
    )

@router.post("/me/kyc/upload")
def upload_kyc_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """
    The Evidence Locker.
    Stores physical files (Photos/Videos) and returns the restricted access URL.
    """
    try:
        # ## SECURITY FIRST:
        # 1. Validate File Size (Max 20MB)
        MAX_SIZE = 20 * 1024 * 1024
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        
        if size > MAX_SIZE:
            raise HTTPException(status_code=400, detail="This file exceeds the 20MB limit.")

        # 2. Validate File Type
        ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "application/pdf"]
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="This format is restricted. Photos, Videos, and PDFs only.")

        # Create directory if missing
        upload_dir = os.path.join("app", "static", "uploads", "kyc")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Security: Rename file to avoid collisions and directory traversal
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"user_{current_user.id}_{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(upload_dir, unique_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the public URL
        return {"document_url": f"/static/uploads/kyc/{unique_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="The file storage operation failed: " + str(e))

@router.get("/me/kyc/status", response_model=UserKYCStatus)
def check_kyc_folder(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Retrieves the user's KYC status and submission history.
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