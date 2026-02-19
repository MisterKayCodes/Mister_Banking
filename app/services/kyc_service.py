from sqlalchemy.orm import Session
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.user import User
from fastapi import HTTPException

# -------------------- ADMIN: RULE MANAGEMENT --------------------

def create_kyc_requirement(db: Session, name: str, description: str, is_required: bool = True):
    # ## Mister, this lets you add new laws to the bank on the fly.
    new_req = KYCRequirement(name=name, description=description, is_required=is_required)
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

def delete_kyc_requirement(db: Session, requirement_id: int):
    # ## Mister, total control: remove a law if it's no longer needed.
    req = db.query(KYCRequirement).filter(KYCRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")
    
    db.delete(req)
    db.commit()
    return {"detail": "Requirement deleted, Mister."}

def get_all_kyc_requirements(db: Session):
    # ## This shows you the full list of what you're asking from your citizens.
    return db.query(KYCRequirement).all()

# -------------------- USER: SUBMISSION LOGIC --------------------

def submit_kyc_document(db: Session, user_id: int, requirement_id: int, document_url: str):
    req = db.query(KYCRequirement).filter(KYCRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    existing = db.query(KYCSubmission).filter(
        KYCSubmission.user_id == user_id, 
        KYCSubmission.requirement_id == requirement_id
    ).first()

    if existing:
        existing.document_url = document_url
        existing.status = "pending"
        new_obj = existing
    else:
        new_obj = KYCSubmission(
            user_id=user_id, requirement_id=requirement_id, document_url=document_url, status="pending"
        )
        db.add(new_obj)

    # ## MISTER, AUTOMATION: 
    # ## Transition user to pending if they aren't already verified.
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.kyc_status != "verified":
        user.kyc_status = "pending"

    db.commit()
    db.refresh(new_obj)
    return new_obj

# -------------------- ADMIN: THE VERDICT & AUTO-UPGRADE --------------------

def review_kyc_submission(db: Session, submission_id: int, status: str, comment: str):
    submission = db.query(KYCSubmission).filter(KYCSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission.status = status
    submission.admin_comment = comment
    
    db.flush() 

    # ## MISTER, THE MAGIC BULLET:
    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if status == "approved":
        # Get all required doc IDs
        required_req_ids = db.query(KYCRequirement.id).filter(KYCRequirement.is_required == True).all()
        required_req_ids = [r[0] for r in required_req_ids]
        
        # Check how many of those the user has approved
        approved_count = db.query(KYCSubmission).filter(
            KYCSubmission.user_id == user.id,
            KYCSubmission.status == "approved",
            KYCSubmission.requirement_id.in_(required_req_ids)
        ).count()

        # If they hit the target, they are officially verified!
        if approved_count >= len(required_req_ids):
            user.kyc_status = "verified" 
    
    elif status == "rejected":
        user.kyc_status = "unverified" 

    db.commit()
    db.refresh(submission)
    return submission