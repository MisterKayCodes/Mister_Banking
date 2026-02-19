"""Service for managing SystemConfig values dynamically."""
from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.system_config import SystemConfig
from app.models.kyc import KYCRequirement
from app.models.user import User
from app.models.account import Account
from app.core.security import hash_password # Mister, we use the hash we perfected!

# ## The default rules for Mister's Bank. 
DEFAULTS = {
    "transfer_fee_percent": ("1.0", "Fee percentage for standard transfers"),
    "instant_transfer_fee_percent": ("2.0", "Fee percentage for instant transfers"),
    "transaction_delay_minutes": ("5", "Delay in minutes before processing"),
    "blocked_message": ("Transaction temporarily blocked", "Message shown when transaction is blocked"),
    "reversal_message": ("Transaction reversed by admin", "Message shown when transaction is reversed"),
    "maintenance_mode": ("false", "System-wide maintenance mode (true/false)"),
    "unverified_transaction_limit": ("500.0", "Daily limit for unverified users"),
    "verified_transaction_limit": ("10000.0", "Daily limit for verified users"),
}

KYC_DEFAULTS = {
    "Passport or National ID": ("High-resolution scan of the photo page", True),
    "Proof of Address": ("Utility bill or bank statement from the last 3 months", True),
    "Face Verification": ("A clear selfie holding your ID card", False),
}

def seed_defaults(db: Session):
    """Seed default SystemConfig and KYC Requirements if they don't exist."""
    
    # ## 1. Seed System Configuration
    for key, (value, desc) in DEFAULTS.items():
        existing = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if not existing:
            db.add(SystemConfig(key=key, value=value, description=desc))
    
    # ## 2. Seed KYC Requirements
    try:
        for name, (desc, required) in KYC_DEFAULTS.items():
            existing = db.query(KYCRequirement).filter(KYCRequirement.name == name).first()
            if not existing:
                db.add(KYCRequirement(name=name, description=desc, is_required=required))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Mister, KYC seeding skipped: {e}")

def seed_test_users(db: Session):
    # ## 1. THE FOUNDER (Admin)
    admin = db.query(User).filter(User.email == "admin@gmail.com").first()
    if not admin:
        admin = User(
            full_name="Mister Admin",
            email="admin@gmail.com",
            # Mister, check if your model uses password_hash or hashed_password!
            # I am changing it to password_hash here based on your previous logs.
            password_hash=hash_password("admin"), 
            is_admin=True,
            is_active=True,
            kyc_status="verified"
        )
        db.add(admin)
        db.flush() 
        
        admin_acc = Account(
            user_id=admin.id,
            account_number="1000000001",
            balance=Decimal("125000.00"),
            currency="USD",
            is_active=True
        )
        db.add(admin_acc)

    # ## 2. THE CITIZEN (John Stones)
    john = db.query(User).filter(User.email == "johnstones@gmail.com").first()
    if not john:
        john = User(
            full_name="John Stones",
            email="johnstones@gmail.com",
            password_hash=hash_password("johnstones"), # Matching the name here too!
            is_admin=False,
            is_active=True,
            kyc_status="verified"
        )
        db.add(john)
        db.flush()
        
        john_acc = Account(
            user_id=john.id,
            account_number="1000000002",
            balance=Decimal("1500.00"),
            currency="USD",
            is_active=True
        )
        db.add(john_acc)

    db.commit()

def get_config_value(db: Session, key: str) -> str:
    """Fetch a config value by key, falling back to defaults."""
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if cfg:
        return cfg.value
    default = DEFAULTS.get(key)
    return default[0] if default else ""

def get_config_float(db: Session, key: str) -> float:
    # ## Ensuring the math stays precise for the fee calculations.
    return float(get_config_value(db, key) or "0")

def get_config_int(db: Session, key: str) -> int:
    # ## Handling the delay timers. We cast through float just in case, Mister.
    return int(float(get_config_value(db, key) or "0"))

def get_all_configs(db: Session):
    # ## The full view for the admin dashboard.
    return db.query(SystemConfig).all()

def update_config(db: Session, key: str, value: str):
    # ## God-mode: Update the bank's behavior on the fly.
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not cfg:
        cfg = SystemConfig(key=key, value=value, description="")
        db.add(cfg)
    else:
        cfg.value = value
    db.commit()
    db.refresh(cfg)
    return cfg