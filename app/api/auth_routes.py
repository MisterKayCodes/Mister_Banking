"""Authentication endpoints: register, login, PIN management."""
from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.core.security import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, PinRequest
from app.schemas.user import UserResponse
from app.services.auth_service import register_user, login_user, set_pin, verify_pin

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    return register_user(db, data.full_name, data.email, data.password)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive a JWT access token."""
    token = login_user(db, data.email, data.password)
    return {"access_token": token}


@router.post("/set-pin")
def create_or_reset_pin(data: PinRequest, db: Session = Depends(get_db),
                         current_user=Depends(get_current_user)):
    """Set or reset transaction PIN for the authenticated user."""
    set_pin(db, current_user.id, data.pin)
    return {"message": "PIN set successfully"}

@router.post("/verify-pin")
def check_pin(data: PinRequest, db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    # ## Mister's Security Check: Let's see if they actually know the secret.
    if not verify_pin(db, current_user.id, data.pin):
        # ## Instead of a polite "false", we slam the door. 
        # ## This triggers a '401' in the terminal so you can see the failure clearly.
        raise HTTPException(
            status_code=401, 
            detail="Invalid PIN. Security alert triggered, Mister."
        )
    
    # ## If they get it right, we let them through.
    return {"valid": True, "message": "Access granted to the vault."}