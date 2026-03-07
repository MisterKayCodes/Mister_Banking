"""Service for managing SystemConfig values dynamically."""
from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.system_config import SystemConfig
from app.models.kyc import KYCRequirement
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet # the Vault is now integrated
from app.core.security import hash_password 
from app.core.crypto import generate_realistic_address # System's Crypto Engine

# ## The default rules for System's Bank. 
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
        print(f"KYC seeding skipped: {e}")

def seed_test_users(db: Session):
    """this ensures the elite have both a bank account and a crypto vault."""
    
    # ## 1. THE FOUNDER (Admin)
    admin = db.query(User).filter(User.email == "admin@gmail.com").first()
    if not admin:
        admin = User(
            full_name="System Administrator",
            email="admin@gmail.com",
            password_hash=hash_password("admin"), 
            is_admin=True,
            is_active=True,
            kyc_status="verified"
        )
        db.add(admin)
        db.flush() 
        
        # Admin Bank Account
        db.add(Account(
            user_id=admin.id,
            account_number="1000000001",
            balance=Decimal("125000.00"),
            currency="USD",
            is_active=True
        ))
        
        # Admin Crypto Vault
        db.add(Wallet(
            user_id=admin.id,
            btc_address=generate_realistic_address("BTC"),
            usdt_address=generate_realistic_address("USDT")
        ))

    # ## 2. THE USER (John Stones)
    john = db.query(User).filter(User.email == "johnstones@gmail.com").first()
    if not john:
        john = User(
            full_name="John Stones",
            email="johnstones@gmail.com",
            password_hash=hash_password("johnstones"),
            is_admin=False,
            is_active=True,
            kyc_status="verified"
        )
        db.add(john)
        db.flush()
        
        # John's Bank Account
        db.add(Account(
            user_id=john.id,
            account_number="1000000002",
            balance=Decimal("1500.00"),
            currency="USD",
            is_active=True
        ))
        
        # John's Crypto Vault
        db.add(Wallet(
            user_id=john.id,
            btc_address=generate_realistic_address("BTC"),
            usdt_address=generate_realistic_address("USDT")
        ))

    db.commit()

    # ## -------------------- THE MISTER BACKFILL --------------------
    # we find any user missing their vault and build it now.
    # This is why the admin list was empty before!
    users_without_wallets = db.query(User).filter(~User.wallet.has()).all()
    if users_without_wallets:
        for user in users_without_wallets:
            db.add(Wallet(
                user_id=user.id,
                btc_address=generate_realistic_address("BTC"),
                usdt_address=generate_realistic_address("USDT")
            ))
        db.commit()
        print(f"I've just secured {len(users_without_wallets)} user vaults.")
    # ## -----------------------------------------------------------

def get_config_value(db: Session, key: str) -> str:
    """Fetch a config value by key, falling back to defaults."""
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if cfg:
        return cfg.value
    default = DEFAULTS.get(key)
    return default[0] if default else ""

def get_config_float(db: Session, key: str) -> float:
    return float(get_config_value(db, key) or "0")

def get_config_int(db: Session, key: str) -> int:
    return int(float(get_config_value(db, key) or "0"))

def get_all_configs(db: Session):
    return db.query(SystemConfig).all()

def update_config(db: Session, key: str, value: str):
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not cfg:
        cfg = SystemConfig(key=key, value=value, description="")
        db.add(cfg)
    else:
        cfg.value = value
    db.commit()
    db.refresh(cfg)
    return cfg