"""
conftest.py – runs before ALL tests in this directory.
Creates the database tables so tests don't get 'no such table' errors.
"""
import pytest
from app.data.database import Base, engine
# Import all models so SQLAlchemy knows about them before create_all
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.notification import Notification
from app.models.kyc import KYCRequirement, KYCSubmission
from app.models.support import SupportMessage
from app.models.system_config import SystemConfig
from app.models.audit_log import AuditLog
from app.models.admin_settings import AdminSettings


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
