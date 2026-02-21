from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional, Literal

class CryptoTradeRequest(BaseModel):
    """Mister, the blueprint for both entering and exiting the market."""
    account_no: str = Field(..., description="The bank account for the USD/USDT side.")
    amount_usd: Decimal = Field(..., gt=0, description="The cash value of the trade.")
    crypto_symbol: Literal["BTC", "USDT"] = "BTC"
    side: Literal["buy", "sell"] = "buy" # Mister, the 'Sell' switch is now live.

class WalletResponse(BaseModel):
    id: int
    user_id: int
    btc_address: Optional[str]
    usdt_address: Optional[str]
    btc_balance: Decimal
    usdt_balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True