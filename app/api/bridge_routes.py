from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.config import settings
from app.data.database import get_db
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.schemas.bridge import BridgeTransferRequest, BridgeStatusResponse
from app.services.bridge_confirmation import schedule_confirmation

router = APIRouter(prefix="/bridge", tags=["Bridge"])


@router.post("/receive-transfer", status_code=status.HTTP_202_ACCEPTED)
def receive_transfer(
    payload: BridgeTransferRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # 1. Secret validation
    secret = request.headers.get("X-Bridge-Secret")
    if secret != settings.BRIDGE_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid bridge secret")

    # 2. Idempotency – unique constraint on bridge_transfer_id
    existing = (
        db.query(Transaction)
        .filter(Transaction.bridge_transfer_id == payload.transfer_id)
        .first()
    )
    if existing:
        return JSONResponse(content={"status": "duplicate", "transfer_id": existing.id}, status_code=200)

    # 3. Currency‑specific wallet lookup
    if payload.currency.upper() == "BTC":
        wallet = (
            db.query(Wallet)
            .filter(Wallet.btc_address == payload.target_address)
            .first()
        )
    else:  # assume USDT
        wallet = (
            db.query(Wallet)
            .filter(Wallet.usdt_address == payload.target_address)
            .first()
        )
    
    if not wallet:
        return JSONResponse(
            content={"bridge_skipped": True, "reason": "address_not_found"},
            status_code=200
        )

    # 4. Look up the account linked to this wallet's user
    from app.models.account import Account
    import uuid as _uuid
    account = (
        db.query(Account)
        .filter(Account.user_id == wallet.user_id)
        .first()
    )
    if not account:
        return JSONResponse(
            content={"bridge_skipped": True, "reason": "no_account_for_wallet"},
            status_code=200
        )

    # 5. Create bridge transaction
    new_tx = Transaction(
        sender_account_id=account.id,
        sender_no=payload.sender_address,
        receiver_no=payload.target_address,
        amount=payload.amount,
        currency=payload.currency.upper(),
        status="pending",
        transfer_type="bridge",
        is_bridge=True,
        bridge_transfer_id=payload.transfer_id,
        confirmations=0,
        reference=str(_uuid.uuid4()),
    )
    db.add(new_tx)
    db.flush()
    tx_id = new_tx.id
    db.commit()

    # 5. Schedule background confirmation steps
    background_tasks.add_task(
        schedule_confirmation,
        tx_id=tx_id,
        asset=payload.currency.upper(),
        amount=payload.amount,
        target_address=payload.target_address,
    )

    return {
        "confirmations": 0,
        "total": settings.BRIDGE_CONFIRMATION_BLOCKS,
        "status": "pending",
        "transfer_id": tx_id
    }


@router.get("/status/{tx_id}")
def bridge_status(
    tx_id: int,
    db: Session = Depends(get_db),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.is_bridge == True)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Bridge transfer not found")
    
    return {
        "confirmations": tx.confirmations,
        "total": settings.BRIDGE_CONFIRMATION_BLOCKS,
        "status": tx.status,
    }