from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# -------------------- REQUIREMENT SCHEMAS (Admin's Rulebook) --------------------

class KYCRequirementBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_required: bool = True

class KYCRequirementCreate(KYCRequirementBase):
    """use this to define a new document type."""
    pass

class KYCRequirementResponse(KYCRequirementBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# -------------------- SUBMISSION SCHEMAS (User's Proof) --------------------

class KYCSubmissionBase(BaseModel):
    requirement_id: int
    document_url: str

class KYCSubmissionCreate(KYCSubmissionBase):
    """this is what the user sends when they upload a file."""
    pass

class KYCSubmissionUpdate(BaseModel):
    """use this to approve or reject a specific document."""
    status: str  # 'approved' or 'rejected'
    admin_comment: Optional[str] = None

class KYCSubmissionResponse(KYCSubmissionBase):
    id: int
    user_id: int
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # We include the requirement name so the Admin knows what they are looking at.
    requirement: Optional[KYCRequirementResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# -------------------- MASTER VIEW (The Folder) --------------------

class UserKYCStatus(BaseModel):
    """
    this provides a bird's-eye view of a user's entire folder.
    """
    user_id: int
    full_name: str
    is_fully_verified: bool
    submissions: List[KYCSubmissionResponse]