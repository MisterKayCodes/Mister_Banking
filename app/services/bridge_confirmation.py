import time
import logging
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.config import settings
from app.data.database import SessionLocal

log = logging.getLogger(__name__)

def _credit_wallet(db: Session, wallet: Wallet, asset: str, amount: Decimal):
    """Lock the wallet row and add the amount to the appropriate balance column."""
    locked = (
        db.query(Wallet)
        .filter(Wallet.id == wallet.id)
        .with_for_update()
        .one()
    )
    if asset.upper() == "BTC":
        locked.btc_balance = (locked.btc_balance or 0) + amount
    else:
        locked.usdt_balance = (locked.usdt_balance or 0) + amount
    db.add(locked)

def schedule_confirmation(*, tx_id: int, asset: str, amount: Decimal, target_address: str):
    """Runs in a FastAPI BackgroundTasks thread pool.
    Executes the step‑wise confirmation flow and credits the user's wallet.
    """
    steps = settings.BRIDGE_CONFIRMATION_BLOCKS
    delay = settings.BRIDGE_STEP_DELAY

    for step in range(1, steps + 1):
        time.sleep(delay)
        db: Session = SessionLocal()
        try:
            tx = (
                db.query(Transaction)
                .filter(Transaction.id == tx_id)
                .with_for_update()
                .first()
            )
            if not tx:
                log.error("Bridge tx %s vanished during confirmation", tx_id)
                return
            if tx.status in ("success", "failed"):
                return
            tx.confirmations = step
            db.add(tx)
            db.commit()
            log.info("Bridge tx %s confirmation %s/%s", tx_id, step, steps)
        finally:
            db.close()

    # Finalisation – mark success and credit wallet
    db = SessionLocal()
    try:
        tx = (
            db.query(Transaction)
            .filter(Transaction.id == tx_id)
            .with_for_update()
            .first()
        )
        if not tx:
            log.error("Bridge tx %s missing at finalisation", tx_id)
            return
        tx.status = "success"
        db.add(tx)
        db.commit()

        wallet = (
            db.query(Wallet)
            .filter(
                or_(Wallet.btc_address == target_address, Wallet.usdt_address == target_address)
            )
            .with_for_update()
            .first()
        )
        if not wallet:
            tx.status = "failed"
            db.add(tx)
            db.commit()
            log.error("Wallet for bridge tx %s disappeared before credit", tx_id)
            return
        _credit_wallet(db, wallet, asset, Decimal(str(amount)))
        db.commit()
        log.info("Bridge tx %s fully confirmed and wallet credited", tx_id)
    except Exception as exc:
        db.rollback()
        # mark as failed
        db2 = SessionLocal()
        try:
            tx = db2.query(Transaction).filter(Transaction.id == tx_id).first()
            if tx:
                tx.status = "failed"
                db2.add(tx)
                db2.commit()
        finally:
            db2.close()
        log.exception("Unexpected error in bridge confirmation for %s", tx_id)
    finally:
        db.close()
