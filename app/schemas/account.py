from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AccountCreate(BaseModel):
    currency: str = "USDT"

class AccountResponse(BaseModel):
    id: int
    user_id: int
    
    # ## Mister, this is the 10-digit identity we've been working for!
    account_number: str
    
    currency: str
    
    # ## Swapped float for Decimal. Precision is power in this bank.
    balance: Decimal
    
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True