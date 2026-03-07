from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum

class TransferType(str, Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"

class TransactionCreate(BaseModel):
    from_account_no: str = Field(..., min_length=10, max_length=10)
    transfer_type: TransferType = Field(default=TransferType.INTERNAL)
    amount: Decimal = Field(..., gt=0)
    
    # ## -------------------- #COPY: THE MISSING PIN --------------------
    # this is the fix for the AttributeError. 
    # We need this slot to receive the key from the UI or tests.
    pin: str = Field(..., min_length=4, max_length=6) 
    # ## -----------------------------------------------------------------
    
    # ## Path A: Internal
    to_account_no: Optional[str] = Field(None, min_length=10, max_length=10)
    
    # ## Path B: External (Overseas) - Consolidated fields
    external_bank_name: Optional[str] = None
    external_swift_bic: Optional[str] = Field(None, min_length=8, max_length=11)
    external_iban_or_acc: Optional[str] = None
    recipient_full_name: Optional[str] = None
    recipient_address: Optional[str] = None
    purpose_of_transfer: Optional[str] = None

    @model_validator(mode='after')
    def validate_logic(self) -> 'TransactionCreate':
        # ## one validator to rule them all.
        if self.transfer_type == TransferType.INTERNAL:
            if not self.to_account_no:
                raise ValueError("Internal moves require a 10-digit recipient number.")
        
        elif self.transfer_type == TransferType.EXTERNAL:
            # Check the "Big Four" for overseas wires
            if not all([self.external_bank_name, self.external_swift_bic, 
                        self.external_iban_or_acc, self.recipient_full_name]):
                raise ValueError("Overseas wires require Bank Name, SWIFT, Account/IBAN, and Recipient Name.")
        return self

class BuyCryptoRequest(BaseModel):
    account_no: str = Field(..., min_length=10, max_length=10)
    crypto_symbol: str = Field(..., pattern="^(BTC|ETH|USDT)$")
    amount_usdt: Decimal = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=6) # crypto needs a PIN too!

class SellCryptoRequest(BaseModel):
    account_no: str = Field(..., min_length=10, max_length=10)
    crypto_symbol: str = Field(..., pattern="^(BTC|ETH|USDT)$")
    amount_usdt: Decimal = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=6) # crypto needs a PIN too!

class TransactionResponse(BaseModel):
    id: int
    reference: str
    transfer_type: TransferType
    
    # ## these are the 'Identity' strings we added to the DB
    sender_no: str 
    receiver_no: Optional[str] = None
    
    amount: Decimal
    currency: str
    fee: Decimal
    status: str
    
    # ## External context for the UI
    external_bank_name: Optional[str] = None
    recipient_full_name: Optional[str] = None
    
    is_reversible: bool
    created_at: Optional[datetime] = None

    # #COPY: Pydantic V2 style to stop those warnings in pytest
    model_config = ConfigDict(from_attributes=True)


class TransactionReceipt(BaseModel):
    reference: str
    sender_account_id: int
    receiver_account_id: Optional[int] = None
    external_info: Optional[str] = None # ## To show the outside bank info on the receipt
    amount: Decimal
    fee: Decimal
    currency: str
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CryptoTransferRequest(BaseModel):
    """the blueprint for sending digital gold to the world."""
    account_no: str = Field(..., min_length=10, max_length=10)
    crypto_symbol: str = Field(..., pattern="^(BTC|ETH|USDT)$")
    amount_crypto: Decimal = Field(..., gt=0) # We use 'amount_crypto' to avoid confusion with USD
    to_address: str = Field(...) 
    pin: str = Field(..., min_length=4, max_length=6)

class CryptoAddressResponse(BaseModel):
    """a clean way to show the user their vault addresses."""
    btc_address: str
    usdt_address: str
    eth_address: Optional[str] = None