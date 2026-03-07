from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AccountCreate(BaseModel):
    currency: str = "USDT"

class AccountResponse(BaseModel):
    id: int
    user_id: int
    
    # ## this is the 10-digit identity we've been working for!
    account_number: str
    
    currency: str
    
    # ## Swapped float for Decimal. Precision is power in this bank.
    balance: Decimal
    
    owner_name: Optional[str] = None
    type: Optional[str] = "Standard"
    
    is_active: bool
    created_at: Optional[datetime] = None

    # ## NEW: Virtual fields injected from the User's Wallet
    btc_balance: Optional[Decimal] = None
    usdt_balance: Optional[Decimal] = None
    btc_address: Optional[str] = None
    usdt_address: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)