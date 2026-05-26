from fastapi import HTTPException, Request

from app.config import settings

def verify_bridge_secret(request: Request):
    secret = request.headers.get("X-Bridge-Secret")
    if secret != settings.BRIDGE_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid bridge secret")
