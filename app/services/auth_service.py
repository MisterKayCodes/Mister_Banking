"""Authentication service: register, login, PIN management."""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.account import Account 
from app.models.wallet import Wallet  # added the Crypto Vault model
from app.core.security import hash_password, verify_password, create_access_token
from app.core.ledger_tools import generate_account_number
from app.core.crypto import generate_realistic_address # added the Address Generator

# -------------------- REGISTRATION --------------------

def register_user(db: Session, full_name: str, email: str, date_of_birth: str, password: str):
    """this creates the user and their dual-vault system."""
    # 1. Check if the vault door is already taken
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="That email is already in the vault."
        )
    
    is_first_user = db.query(User).count() == 0
    
    # we wrap the creation in a try-block for 'Absolute Integrity'.
    try:
        # 1. Create the User (The Master Record)
        user = User(
            full_name=full_name,
            email=email,
            date_of_birth=date_of_birth,
            password_hash=hash_password(password),
            is_active=True,
            is_admin=is_first_user
        )
        db.add(user)
        # flush() is the secret sauce—it generates the user.id 
        # for our child tables without finishing the transaction yet.
        db.flush() 
        
        # 2. The Bank Account (Fiat/USDT Ledger)
        new_bank_vault = Account(
            user_id=user.id,
            account_number=generate_account_number(),
            currency="USDT",
            balance=0.0,
            is_active=True
        )
        db.add(new_bank_vault)

        # 3. The Crypto Vault (Using System's Crypto Engine)
        # ## 'the User needs their keys generated on the fly.'
        new_crypto_vault = Wallet(
            user_id=user.id,
            btc_address=generate_realistic_address("BTC"),
            usdt_address=generate_realistic_address("USDT"),
            btc_balance=0.0,
            usdt_balance=0.0
        )
        db.add(new_crypto_vault)

        # 'we seal the vault only when every piece is perfect.'
        db.commit()
        db.refresh(user)
        return user

    except Exception as e:
        db.rollback() # 'total wipeout if a single error occurs.'
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"the system failed to build the vault: {str(e)}"
        )

# -------------------- ACCESS & SECURITY --------------------

def login_user(db: Session, email: str, password: str) -> str:
    """Looking up the user in our records."""
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Wrong key or wrong identity. Try again."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"suspended:{user.email}"
        )

    return create_access_token({"sub": str(user.id)})

def set_pin(db: Session, user_id: int, pin: str):
    """the second factor: The Transaction PIN."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in the records.")
    
    # Hashing the PIN just like a password for maximum security.
    user.pin_hash = hash_password(pin)
    db.commit()

def verify_pin(db: Session, user_id: int, pin: str) -> bool:
    """Verifying the secret before any money moves."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.pin_hash:
        return False
        
    return verify_password(pin, user.pin_hash)


def change_password(db: Session, user_id: int, old_password: str, new_password: str):
    """The security reset: Upgrading the login key."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Identity record not found.")

    if not verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password verification failed.")

    user.password_hash = hash_password(new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}