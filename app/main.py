"""Mister Banking API - Main application entry point."""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.data.database import Base, engine, SessionLocal
# Mister, we only import the seeding functions here to keep the top-level clean.
from app.services.config_service import seed_defaults, seed_test_users

# ## -------------------- MODEL REGISTRATION --------------------
# Mister, IMPORTANT: We must import these here so SQLAlchemy 
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
# Mister, don't forget to add your new notification router here!
from app.api.notification_routes import router as notification_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ## Mister, this builds the tables if they are missing.
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
    title="Mister Banking API",
    description="A dynamic, configurable banking system with god-mode admin panel.",
    version="1.0.0",
    lifespan=lifespan,
)

@app.middleware("http")
async def maintenance_guard(request: Request, call_next):
    exempt_paths = ["/admin", "/auth", "/docs", "/openapi.json"]
    if any(request.url.path.startswith(path) for path in exempt_paths) or request.url.path == "/":
        return await call_next(request)

    # ## MISTER: Local import to avoid the circular import death loop.
    from app.models.system_config import SystemConfig
    
    db = SessionLocal()
    try:
        maintenance_mode = db.query(SystemConfig).filter(SystemConfig.key == "maintenance_mode").first()
        if maintenance_mode and maintenance_mode.value.lower() == "true":
            return JSONResponse(
                status_code=503,
                content={"detail": "System is under maintenance. Please try again later, Mister."}
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
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(account_router)
app.include_router(transaction_router)
app.include_router(admin_router)
app.include_router(notification_router) # Registered for the React frontend!

@app.get("/", tags=["Health"])
def root():
    return {"service": "Mister Banking API", "status": "running"}

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
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)