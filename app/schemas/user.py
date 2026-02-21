from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
# Mister, we must import these so UserResponse knows what they look like!
from app.schemas.account import AccountResponse
from app.schemas.wallet import WalletResponse

# ## The blueprint for new arrivals. 
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

# ## For when we need to tweak the settings on an existing account.
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_admin: bool
    is_active: bool
    kyc_status: str = "unverified"
    
    # ## THE DUAL-VAULT LINK
    # Mister, this lets the frontend see the whole empire in one request.
    wallet: Optional[WalletResponse] = None
    accounts: List[AccountResponse] = []
    
    created_at: Optional[datetime] = None

    class Config:
        # ## Telling Pydantic to read our SQLAlchemy models like a pro.
        from_attributes = True