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

# we now use the central oracle from your crypto utility!
from app.core.crypto import get_live_btc_price, validate_external_address

def execute_crypto_purchase(db: Session, user_id: int, account_no: str, usd_amount: Decimal, crypto_symbol: str):
    """
    this is the main engine. 
    It trades Bank USD for Wallet Crypto with real-time accuracy.
    """
    # 1. Look up the User and their Vaults
    user = db.query(User).filter(User.id == user_id).first()
    account = db.query(Account).filter(Account.account_number == account_no).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # thanks to our backfill logic, this check should always pass!
    if not user.wallet:
        raise HTTPException(status_code=400, detail="this user's vault hasn't been built yet.")
        
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch or account missing.")

    # ## Security Check: Is this user banned from the exchange floor?
    if user.trading_blocked:
        reason = user.trading_block_reason or "Suspicious activity detected."
        raise HTTPException(status_code=403, detail=f"Trading Blocked: {reason}")

    # 2. Liquidity Check
    if account.balance < usd_amount:
        raise HTTPException(status_code=400, detail="Insufficient bank balance for this trade.")

    try:
        # 3. Fetch Real Rate & Calculate (The Oracle Call)
        if crypto_symbol.upper() == "BTC":
            price = get_live_btc_price()
            # 'division by zero check' is built into our Decimal logic.
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

        # 6. Notify the User (The Receipt Ping)
        send_notification(
            db, user_id,
            title="Crypto Purchase Success",
            message=f"Success! You received {crypto_received:.8f} {crypto_symbol}.",
            n_type="success"
        )

        return tx

    except Exception as e:
        db.rollback()
        # 'if the market oracle fails, the money stays in the pocket.'
        raise HTTPException(status_code=500, detail=f"Trade failed: {str(e)}")


def execute_crypto_sale(db: Session, user_id: int, account_no: str, crypto_amount: Decimal, crypto_symbol: str):
    """
    the reverse engine. 
    It trades Wallet Crypto for Bank USD with real-time accuracy.
    """
    # 1. Get the User and their Vaults
    user = db.query(User).filter(User.id == user_id).first()
    account = db.query(Account).filter(Account.account_number == account_no).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not user.wallet:
        raise HTTPException(status_code=400, detail="this user doesn't have a crypto wallet.")
        
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Ownership mismatch or account missing.")

    # ## Security Check: Is this user banned from the exchange floor?
    if user.trading_blocked:
        reason = user.trading_block_reason or "Suspicious activity detected."
        raise HTTPException(status_code=403, detail=f"Trading Blocked: {reason}")

    # 2. Check the Math (Liquidity Check - Do they have the BTC?)
    if crypto_symbol.upper() == "BTC":
        if user.wallet.btc_balance < crypto_amount:
            raise HTTPException(status_code=400, detail="Insufficient BTC in your vault.")
    else: # USDT
        if user.wallet.usdt_balance < crypto_amount:
            raise HTTPException(status_code=400, detail="Insufficient USDT in your vault.")

    try:
        # 3. Fetch Real Rate & Calculate (The Oracle Call)
        if crypto_symbol.upper() == "BTC":
            price = get_live_btc_price()
            usd_received = crypto_amount * price # Multiply to get USD
        else: # USDT (Stable at 1:1)
            price = Decimal("1.00")
            usd_received = crypto_amount

        # 4. Execute the Swap (The Atomic Move)
        # We take the Crypto and give the Cash
        if crypto_symbol.upper() == "BTC":
            user.wallet.btc_balance -= crypto_amount
        else:
            user.wallet.usdt_balance -= crypto_amount
            
        account.balance += usd_received

        # 5. Record the History (The Ledger Entry)
        tx = Transaction(
            reference=str(uuid.uuid4()),
            sender_account_id=account.id, # We use this to show where the money LANDED
            sender_no=account.account_number,
            amount=usd_received, 
            currency=crypto_symbol.upper(),
            status="success",
            details=f"Sold {crypto_amount:.8f} {crypto_symbol} at ${price}/unit",
            created_at=datetime.utcnow()
        )
        
        db.add(tx)
        db.commit()
        db.refresh(tx)

        # 6. Notify the User
        send_notification(
            db, user_id,
            title="Crypto Sale Success",
            message=f"You sold {crypto_amount:.8f} {crypto_symbol} for ${usd_received:,.2f}.",
            n_type="success"
        )

        return tx

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Sale failed: {str(e)}")


def execute_crypto_transfer(db: Session, user_id: int, crypto_symbol: str, amount: Decimal, to_address: str, pin: str):
    """
    the Smart Bridge.
    Detects if the address is internal for instant credit, otherwise sends external.
    """
    from app.services.auth_service import verify_pin 
    from app.core.crypto import validate_external_address
    
    # 1. Identity Check
    user = db.query(User).filter(User.id == user_id).first()
    if not verify_pin(db, user_id, pin):
        raise HTTPException(status_code=401, detail="Invalid PIN. The vault stays locked.")

    # 2. Format Validation
    if not validate_external_address(to_address, crypto_symbol):
        raise HTTPException(status_code=400, detail=f"Invalid {crypto_symbol} address format.")

    wallet = user.wallet
    symbol = crypto_symbol.upper()

    # 3. Liquidity Check
    sender_balance = wallet.btc_balance if symbol == "BTC" else wallet.usdt_balance
    if sender_balance < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient {symbol} for this transfer.")

    try:
        # --- THE SMART BRIDGE LOGIC START ---
        # 4. Check if the address belongs to another User in our bank
        recipient_wallet = None
        if symbol == "BTC":
            recipient_wallet = db.query(Wallet).filter(Wallet.btc_address == to_address).first()
        else:
            recipient_wallet = db.query(Wallet).filter(Wallet.usdt_address == to_address).first()

        # 5. Execute the Swap
        # Debit the sender
        if symbol == "BTC":
            wallet.btc_balance -= amount
        else:
            wallet.usdt_balance -= amount

        transfer_type = "external"
        tx_details = f"Withdrawal of {amount} {symbol} to {to_address}"

        if recipient_wallet:
            # Credit the internal recipient (Instant!)
            if symbol == "BTC":
                recipient_wallet.btc_balance += amount
            else:
                recipient_wallet.usdt_balance += amount
            
            transfer_type = "internal"
            tx_details = f"Internal transfer to User {recipient_wallet.user.full_name}"
        # --- THE SMART BRIDGE LOGIC END ---

        # 5.5 If external, check Fchain bridge
        from app.config import settings
        import httpx
        if not recipient_wallet and settings.BANKING_BRIDGE_ENABLED:
            try:
                # Verify address with Fchain
                verify_url = f"{settings.FCHAIN_BRIDGE_URL}/verify-address/{symbol}/{to_address}"
                resp = httpx.get(verify_url, timeout=5.0)
                if resp.status_code == 200 and resp.json().get("exists"):
                    # Send webhook to Fchain
                    webhook_url = f"{settings.FCHAIN_BRIDGE_URL}/receive-transfer"
                    payload = {
                        "sender_address": user.accounts[0].account_number,
                        "target_address": to_address,
                        "amount": float(amount),
                        "currency": symbol,
                        "transfer_id": str(uuid.uuid4())
                    }
                    headers = {"X-Bridge-Secret": settings.BRIDGE_SECRET_KEY}
                    httpx.post(webhook_url, json=payload, headers=headers, timeout=5.0)
                    tx_details += " (Bridged to Fchain)"
            except Exception as bridge_err:
                # If bridge fails, still process as regular external transfer
                import logging
                logging.getLogger(__name__).warning(f"Bridge to Fchain failed: {bridge_err}")

        # 6. Record the Ledger
        prefix = "INT" if transfer_type == "internal" else "OUT"
        tx = Transaction(
            reference=f"{prefix}-{uuid.uuid4().hex[:8].upper()}",
            sender_account_id=user.accounts[0].id,
            sender_no=user.accounts[0].account_number,
            receiver_no=recipient_wallet.user.accounts[0].account_number if recipient_wallet else None,
            amount=amount,
            currency=symbol,
            status="success",
            details=tx_details,
            created_at=datetime.utcnow()
        )
        db.add(tx)
        
        # 7. Notify both parties if internal
        db.commit()
        db.refresh(tx)

        send_notification(db, user_id, title="Transfer Successful", message=f"Sent {amount} {symbol}.", n_type="success")
        
        if recipient_wallet:
            send_notification(
                db, recipient_wallet.user_id, 
                title="Crypto Received!", 
                message=f"You just received {amount} {symbol} from {user.full_name}!", 
                n_type="success"
            )

        return tx

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")