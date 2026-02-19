import os
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.data.database import get_db

# ## Mister's Vault Secrets - If the environment variable isn't set, we use a fallback.
# ## But in production, we change this immediately.
SECRET_KEY = os.environ.get("SESSION_SECRET", "super-secret-mister-key-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer()

def hash_password(password: str) -> str:
    # ## No plain text touches the database on my watch, Mister.
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    # ## Matching the key to the encrypted lock.
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    # ## Minting the session badge. Valid for 24 hours of power.
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    # ## The Gatekeeper check. We verify the badge before asking any questions.
    from app.models.user import User
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Badge payload is corrupted.")
        user_id = int(user_id_str)
    except (JWTError, Exception):
        # ## If the token is fake or old, the vault stays shut, Mister.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not recognized in the ledger.")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account is on ice, Mister. Contact administration.")
        
    return user

def get_admin_user(current_user=Depends(get_current_user)):
    # ## God-mode Verification.
    if not current_user.is_admin:
        # ## Nice try, but you're not the Founder. Access denied.
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Founder-level clearance required, Mister.")
    return current_user