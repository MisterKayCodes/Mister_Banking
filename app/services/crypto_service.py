"""Crypto Exchange Service: The high-precision trade engine."""
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.services.notification_service import send_notification

# Mister, we now use the central oracle from your crypto utility!
from app.core.crypto import get_live_btc_price

def execute_crypto_purchase(db: Session, user_id: int, account_no: str, usd_amount: Decimal, crypto_symbol: str):
    """
    Mister, this is the main engine. 
    It trades Bank USD for Wallet Crypto with real-time accuracy.
    """
    # 1. Look up the Citizen and their Vaults
    user = db.query(User).filter(User.id == user_id).first()
    account = db.query(Account).filter(Account.account_number == account_no).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found, Mister.")
    
    # Mister, thanks to our backfill logic, this check should always pass!
    if not user.wallet:
        raise HTTPException(status_code=400, detail="Mister, this user's vault hasn't been built yet.")
        
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch or account missing.")

    # 2. Liquidity Check
    if account.balance < usd_amount:
        raise HTTPException(status_code=400, detail="Insufficient bank balance for this trade, Mister.")

    try:
        # 3. Fetch Real Rate & Calculate (The Oracle Call)
        if crypto_symbol.upper() == "BTC":
            price = get_live_btc_price()
            # Mister, 'division by zero check' is built into our Decimal logic.
            crypto_received = usd_amount / price
        else: # USDT (Stable at 1:1)
            price = Decimal("1.00")
            crypto_received = usd_amount

        # 4. Execute the Swap (The Atomic Move)
        account.balance -= usd_amount
        
        if crypto_symbol.upper() == "BTC":
            user.wallet.btc_balance += crypto_received
        else:
            user.wallet.usdt_balance += crypto_received

        # 5. Record the History (The Ledger Entry)
        tx = Transaction(
            reference=str(uuid.uuid4()),
            sender_account_id=account.id,
            sender_no=account.account_number,
            amount=usd_amount, # The cost in USD/USDT
            currency="USD",    # We label this as a fiat-side transaction
            status="success",
            details=f"Exchanged ${usd_amount} for {crypto_received:.8f} {crypto_symbol} (@ ${price})",
            created_at=datetime.utcnow()
        )
        
        db.add(tx)
        db.commit()
        db.refresh(tx)

        # 6. Notify the Citizen (The Receipt Ping)
        send_notification(
            db, user_id,
            title="Crypto Purchase Success",
            message=f"Success, Mister! You received {crypto_received:.8f} {crypto_symbol}.",
            n_type="success"
        )

        return tx

    except Exception as e:
        db.rollback()
        # Mister, 'if the market oracle fails, the money stays in the pocket.'
        raise HTTPException(status_code=500, detail=f"Trade failed: {str(e)}")