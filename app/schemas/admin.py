from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ## Updating the balance requires precision.
class BalanceUpdate(BaseModel):
    new_balance: float

# ## Flipping the switch on account access.
class AccountStatusUpdate(BaseModel):
    is_active: bool

# ## Dynamic configuration updates.
class SystemConfigUpdate(BaseModel):
    value: str

class SystemConfigResponse(BaseModel):
    key: str
    value: str
    description: str

    class Config:
        # ## Allows Pydantic to read SQLAlchemy models directly.
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int] = None
    action: str
    # ## Optional details for those complex 'stealth' or 'manual' moves.
    details: Optional[str] = None
    timestamp: Optional[datetime] = None

class AdminUserUpdate(BaseModel):
    # ## these are the ONLY things you can change.
    # ## If you add a 'phone_number' to your Database later, 
    # ## you just add one line here and it 'plugs in' automatically.
    full_name: Optional[str] = None
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None
    date_of_birth: Optional[str] = None
    password: Optional[str] = None
    account_number: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    kyc_status: Optional[str] = None
    trading_blocked: Optional[bool] = None
    trading_block_reason: Optional[str] = None

    class Config:
        from_attributes = True

class FiatDepositRequest(BaseModel):
    account_id: int
    amount: float
    tag: str

class CryptoDepositRequest(BaseModel):
    user_id: int
    coin: str # 'btc' or 'usdt'
    amount: float
    tag: str