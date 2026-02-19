from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ## The blueprint for new arrivals. We need the password here, Mister.
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
    is_active: bool  # ## Keeping this in sync with our security checks
    created_at: Optional[datetime] = None

    class Config:
        # ## Telling Pydantic to read our SQLAlchemy models like a pro.
        from_attributes = True
        