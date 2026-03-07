from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional, Literal

class CryptoTradeRequest(BaseModel):
    """the blueprint for both entering and exiting the market."""
    account_no: str = Field(..., description="The bank account for the USD/USDT side.")
    amount_usd: Decimal = Field(..., gt=0, description="The cash value of the trade.")
    crypto_symbol: Literal["BTC", "USDT"] = "BTC"
    side: Literal["buy", "sell"] = "buy" # the 'Sell' switch is now live.

class WalletResponse(BaseModel):
    id: int
    user_id: int
    btc_address: Optional[str]
    usdt_address: Optional[str]
    btc_balance: Decimal = Decimal("0.0")
    usdt_balance: Decimal = Decimal("0.0")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)