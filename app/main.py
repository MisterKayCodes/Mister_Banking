"""System Banking API - Main application entry point."""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.data.database import Base, engine, SessionLocal
# we only import the seeding functions here to keep the top-level clean.
from app.services.config_service import seed_defaults, seed_test_users

# ## -------------------- MODEL REGISTRATION --------------------
# IMPORTANT: We must import these here so SQLAlchemy 
# maps all relationships (User <-> Notification) correctly on startup!
from app.models.user import User
from app.models.notification import Notification
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.wallet import Wallet
# ## -----------------------------------------------------------

from app.api.auth_routes import router as auth_router
from app.api.user_routes import router as user_router
from app.api.account_routes import router as account_router
from app.api.transaction_routes import router as transaction_router
from app.api.admin_routes import router as admin_router
# don't forget to add your new notification router here!
from app.api.notification_routes import router as notification_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ## this builds the tables if they are missing.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # ## The bank's DNA is injected here.
        seed_defaults(db)
        seed_test_users(db) 
    finally:
        db.close()
    yield

app = FastAPI(
    title="System Banking API",
    description="A dynamic, configurable banking system with god-mode admin panel.",
    version="1.0.0",
    lifespan=lifespan,
)

@app.middleware("http")
async def maintenance_guard(request: Request, call_next):
    # Paths that are ALWAYS allowed (no maintenance check)
    always_exempt = ["/admin", "/api/admin", "/auth/login", "/auth/register", "/docs", "/openapi.json", "/static"]
    
    # Check if path is exempt
    if any(request.url.path.startswith(path) for path in always_exempt) or request.url.path == "/":
        return await call_next(request)
    
    # Check if the request has a valid admin token (bypass for admins)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        try:
            from app.core.security import decode_token
            payload = decode_token(token)
            if payload.get("is_admin") or payload.get("role") == "admin":
                # Admin user - bypass maintenance mode
                return await call_next(request)
        except Exception:
            pass  # Token invalid - continue to maintenance check
    
    # Check maintenance mode from database
    from app.models.system_config import SystemConfig
    
    db = SessionLocal()
    try:
        maintenance_mode = db.query(SystemConfig).filter(SystemConfig.key == "maintenance_mode").first()
        if maintenance_mode and maintenance_mode.value.lower() == "true":
            return JSONResponse(
                status_code=503,
                content={"detail": "System is under maintenance. Please try again later."}
            )
    except Exception:
        pass
    finally:
        db.close()
    
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ## -------------------- ROUTE REGISTRATION --------------------
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(account_router, prefix="/api")
app.include_router(transaction_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
from app.api.bridge_routes import router as bridge_router
app.include_router(bridge_router, prefix="/api")
app.include_router(notification_router, prefix="/api") # Registered for the React frontend!

# ## THE VAULT STORAGE
# this is where we serve the physical evidence (Photos/Videos).
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/", tags=["Health"])
def root():
    return {"service": "System Banking API", "status": "running"}

# ## -------------------- FRONTEND SERVING --------------------
static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(static_dir):
    from starlette.responses import FileResponse
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))

# ## -------------------- THE START KEY --------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
