from pydantic import BaseModel

class TransactionCreate(BaseModel):
    sender_account_id: int
    receiver_account_id: int
    amount: float
    currency: str = "USD"
    fee: float = 0.0

class TransactionResponse(BaseModel):
    id: int
    sender_account_id: int
    receiver_account_id: int
    amount: float
    currency: str
    fee: float
    status: str
    is_reversible: bool

    class Config:
        from_attributes = True
