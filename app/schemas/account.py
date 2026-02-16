from pydantic import BaseModel

class AccountCreate(BaseModel):
    user_id: int
    currency: str = "USD"

class AccountResponse(BaseModel):
    id: int
    user_id: int
    currency: str
    balance: float
    is_active: bool

    class Config:
        from_attributes = True
