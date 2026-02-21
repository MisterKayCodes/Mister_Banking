# #COPY: Full updated Transaction Routes with Live Crypto Integration
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import (
    TransactionCreate, TransactionResponse, TransactionReceipt, BuyCryptoRequest, SellCryptoRequest,
    CryptoTransferRequest, CryptoAddressResponse
)
from app.services.transaction_service import (
    create_transaction, get_transaction_receipt
)
# Mister, we import the new engine here!
from app.services.crypto_service import (execute_crypto_purchase, execute_crypto_sale,
    execute_crypto_transfer
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse)
def create_new_transaction(data: TransactionCreate, db: Session = Depends(get_db),
                            current_user=Depends(get_current_user)):
    """
    Mister, the main banking engine. 
    Handles PIN checks and internal/external transfers.
    """
    return create_transaction(db, user_id=current_user.id, data=data)

@router.post("/buy-crypto", response_model=TransactionResponse)
def purchase_crypto(data: BuyCryptoRequest, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    """
    Mister, the upgraded Crypto Exchange.
    Uses real-time market prices for BTC and credits the User's high-precision Wallet.
    """
    return execute_crypto_purchase(
        db, 
        user_id=current_user.id, 
        account_no=data.account_no, 
        usd_amount=data.amount_usdt, 
        crypto_symbol=data.crypto_symbol
    )


@router.post("/sell-crypto", response_model=TransactionResponse)
def sell_crypto(data: SellCryptoRequest, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    """
    Mister, the upgraded Crypto Exchange.
    """
    return execute_crypto_sale(
        db, 
        user_id=current_user.id, 
        account_no=data.account_no, 
        # Mister, we use data.amount_usdt because that's what's in your Schema!
        crypto_amount=data.amount_usdt, 
        crypto_symbol=data.crypto_symbol
    )


@router.get("/{tx_id}/receipt", response_model=TransactionReceipt)
def get_receipt(tx_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """Mister, the digital paper trail."""
    return get_transaction_receipt(db, tx_id, current_user.id)

@router.get("/lookup/{account_no}", response_model=dict)
def lookup_receiver(account_no: str, db: Session = Depends(get_db), 
                    current_user=Depends(get_current_user)):
    """Mister, find a citizen by their 10-digit account number."""
    from app.services.transaction_service import _get_account_by_number
    account = _get_account_by_number(db, account_no)
    return {
        "account_no": account.account_number,
        "receiver_name": account.user.full_name,
        "currency": account.currency
    }


@router.post("/send-crypto", response_model=TransactionResponse)
def send_crypto(data: CryptoTransferRequest, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    """
    Mister, the Withdrawal Gate.
    Sends crypto from the internal vault to an external blockchain address.
    """
    return execute_crypto_transfer(
        db, 
        user_id=current_user.id,
        crypto_symbol=data.crypto_symbol,
        amount=data.amount_crypto,
        to_address=data.to_address,
        pin=data.pin
    )

@router.get("/receive-crypto", response_model=CryptoAddressResponse)
def get_my_vault_addresses(current_user=Depends(get_current_user)):
    """
    Mister, the Deposit View.
    Shows the citizen their own bc1q and 0x addresses for funding.
    """
    if not current_user.wallet:
        raise HTTPException(status_code=404, detail="Vault not initialized, Mister.")
    
    return {
        "btc_address": current_user.wallet.btc_address,
        "usdt_address": current_user.wallet.usdt_address
    }