from pydantic import BaseModel, Field
from typing import Optional

class BridgeTransferRequest(BaseModel):
    sender_address: str = Field(..., description="Source address on Fchain")
    target_address: str = Field(..., description="Destination address on Mister Banking (BTC or USDT)")
    amount: str = Field(..., description="Amount as string to preserve precision")
    currency: str = Field(..., description="Currency code, e.g., 'BTC' or 'USDT'")
    transfer_id: str = Field(..., description="Unique transfer identifier from Fchain")

class BridgeStatusResponse(BaseModel):
    confirmations: int = Field(..., description="Number of confirmations completed")
    total: int = Field(..., description="Total confirmations required (configurable)")
    status: str = Field(..., description="Current status, e.g., pending, success, failed")

    class Config:
        orm_mode = True
