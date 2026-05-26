"""
Bridge Integration Tests
========================
These tests validate the /api/bridge/* endpoints.
They use the real SQLite database (recreated fresh each run).
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.data.database import SessionLocal
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.models.user import User
from app.models.account import Account

client = TestClient(app)


def bridge_secret_header():
    return {"X-Bridge-Secret": settings.BRIDGE_SECRET_KEY}


# ---------------------------------------------------------------------------
# Patch schedule_confirmation globally so tests never sleep
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def no_background_sleep():
    """Prevent schedule_confirmation from actually sleeping during tests."""
    with patch("app.api.bridge_routes.schedule_confirmation"):
        yield


# ---------------------------------------------------------------------------
# Helpers – create test data that matches YOUR real schema
# ---------------------------------------------------------------------------

def _get_or_create_test_user(db):
    """Return an existing test user or create one with all required fields."""
    user = db.query(User).filter(User.email == "bridge_test@example.com").first()
    if user:
        return user
    user = User(
        email="bridge_test@example.com",
        full_name="Bridge Test User",
        password_hash="fakehash_for_testing",   # <-- satisfies NOT NULL
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _get_or_create_test_wallet(db, user, btc_address="btc_bridge_test"):
    """Return the user's wallet, or create one."""
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
    if wallet:
        return wallet
    wallet = Wallet(
        user_id=user.id,
        btc_address=btc_address,
        usdt_address="usdt_bridge_test",
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


def _get_or_create_test_account(db, user):
    """Return the user's account, or create one."""
    account = db.query(Account).filter(Account.user_id == user.id).first()
    if account:
        return account
    import random, string
    acc_no = "".join(random.choices(string.digits, k=10))
    account = Account(
        user_id=user.id,
        account_number=acc_no,
        currency="BTC",
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_missing_secret():
    """Requests without X-Bridge-Secret header should get 401."""
    response = client.post(
        "/api/bridge/receive-transfer",
        json={
            "sender_address": "btc1src",
            "target_address": "btc1dst",
            "amount": "0.01",
            "currency": "BTC",
            "transfer_id": "uuid-no-secret",
        },
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"


def test_successful_creation():
    """A valid bridge transfer should return 202 with confirmations=0."""
    db = SessionLocal()
    try:
        user = _get_or_create_test_user(db)
        wallet = _get_or_create_test_wallet(db, user)
        _get_or_create_test_account(db, user)

        payload = {
            "sender_address": "btc1src",
            "target_address": wallet.btc_address,
            "amount": "0.01",
            "currency": "BTC",
            "transfer_id": "uuid-success-1",
        }
        response = client.post(
            "/api/bridge/receive-transfer",
            json=payload,
            headers=bridge_secret_header(),
        )
        assert response.status_code == 202, f"Expected 202, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["confirmations"] == 0
        assert data["status"] == "pending"
    finally:
        db.close()


def test_idempotency():
    """Sending the same transfer_id twice should return 200 with status=duplicate."""
    db = SessionLocal()
    try:
        user = _get_or_create_test_user(db)
        wallet = _get_or_create_test_wallet(db, user)
        _get_or_create_test_account(db, user)

        payload = {
            "sender_address": "btc1src",
            "target_address": wallet.btc_address,
            "amount": "0.01",
            "currency": "BTC",
            "transfer_id": "uuid-idempotency-1",
        }
        
        # First request: should create the transaction
        response1 = client.post(
            "/api/bridge/receive-transfer",
            json=payload,
            headers=bridge_secret_header(),
        )
        assert response1.status_code == 202

        # Second request: should return duplicate
        response2 = client.post(
            "/api/bridge/receive-transfer",
            json=payload,
            headers=bridge_secret_header(),
        )
        assert response2.status_code == 200, f"Expected 200, got {response2.status_code}: {response2.text}"
        assert response2.json()["status"] == "duplicate"
    finally:
        db.close()


def test_address_not_found_returns_skip():
    """An address that doesn't exist in any wallet should return bridge_skipped."""
    payload = {
        "sender_address": "btc1src",
        "target_address": "totally_unknown_address",
        "amount": "10",
        "currency": "BTC",
        "transfer_id": "uuid-skip-1",
    }
    response = client.post(
        "/api/bridge/receive-transfer",
        json=payload,
        headers=bridge_secret_header(),
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["bridge_skipped"] is True
    assert data["reason"] == "address_not_found"
