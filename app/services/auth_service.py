"""Authentication service: register, login, PIN management."""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.account import Account  # ## Added for the automated vault creation.
from app.core.security import hash_password, verify_password, create_access_token
from app.core.ledger_tools import generate_account_number  # ## Using our new 10-digit tool, Mister.

def register_user(db: Session, full_name: str, email: str, password: str):
    # ## Checking the ledger... we don't allow double-entry identities here, Mister.
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="That email is already in the vault, Mister."
        )
    
    # ## Founder's Key Logic: If the vault is empty, the first person gets the crown.
    is_first_user = db.query(User).count() == 0
    
    # ## Hashing the entry key. Bcrypt is doing the heavy lifting.
    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        is_active=True,
        is_admin=is_first_user
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # ## -------------------- AUTOMATIC ACCOUNT CREATION --------------------
    # ## Mister, here is the fix. No more 404s. 
    # ## As soon as they register, they get their unique 10-digit number.
    new_vault = Account(
        user_id=user.id,
        account_number=generate_account_number(),
        currency="USDT",  # ## Default currency for new Misters.
        balance=0.0,
        is_active=True
    )
    db.add(new_vault)
    db.commit()
    # ## ---------------------------------------------------------------------

    return user

# ... (rest of your login and PIN functions stay the same)

def login_user(db: Session, email: str, password: str) -> str:
    # ## Looking up the citizen in our records.
    user = db.query(User).filter(User.email == email).first()
    
    # ## One slip-up and the vault stays sealed. No second chances for hackers.
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Wrong key or wrong identity. Try again, Mister."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account has been frozen. Administrative action required."
        )

    # ## Minting the JWT. This badge proves who they are for the next session.
    return create_access_token({"sub": str(user.id)})

def set_pin(db: Session, user_id: int, pin: str):
    # ## Locating the user for a PIN update.
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in the records.")
    
    # ## We treat the PIN with the same respect as the password. 
    # ## Even the bank owner shouldn't see these digits in plain text.
    user.pin_hash = hash_password(pin)
    db.commit()

def verify_pin(db: Session, user_id: int, pin: str) -> bool:
    # ## Verifying the second-factor secret.
    user = db.query(User).filter(User.id == user_id).first()
    
    # ## No PIN set? Then no money moves. It's that simple.
    if not user or not user.pin_hash:
        return False
        
    return verify_password(pin, user.pin_hash)
