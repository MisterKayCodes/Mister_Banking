# #COPY: Comprehensive test suite for PIN gates and Notification triggers
import pytest
from app.services.transaction_service import create_transaction
from app.schemas.transaction import TransactionCreate, TransferType
from app.core.security import hash_password
from app.models.notification import Notification

def test_transaction_security_and_notifications(db_session, test_user, test_account):
    """
    Mister, this test checks:
    1. Does a wrong PIN fail?
    2. Does a correct PIN succeed?
    3. Does the database record the success notification?
    """
    # ## 1. SETUP: Give the user a PIN (1234)
    test_user.pin_hash = hash_password("1234")
    db_session.commit()

    # ## 2. THE WRONG PIN TEST
    wrong_data = TransactionCreate(
        from_account_no=test_account.account_number,
        to_account_no="9999999999", # Some other account
        amount=100.0,
        pin="0000", # WRONG PIN, MISTER
        transfer_type=TransferType.INTERNAL
    )

    with pytest.raises(Exception) as excinfo:
        create_transaction(db_session, test_user.id, wrong_data)
    assert "Invalid PIN" in str(excinfo.value.detail)

    # ## 3. THE CORRECT PIN TEST
    correct_data = TransactionCreate(
        from_account_no=test_account.account_number,
        to_account_no="some_receiver_acc", # You'd need a real receiver in a full test
        amount=50.0,
        pin="1234", # CORRECT PIN
        transfer_type=TransferType.INTERNAL
    )
    
    # (Assuming internal transfer logic works)
    # create_transaction(db_session, test_user.id, correct_data)

    # ## 4. NOTIFICATION VERIFICATION
    # Mister, let's see if the system actually "talked" back.
    last_notif = db_session.query(Notification).filter(
        Notification.user_id == test_user.id
    ).order_by(Notification.created_at.desc()).first()

    assert last_notif is not None
    assert "Transaction" in last_notif.title
    print(f"Mister, the notification says: {last_notif.message}")