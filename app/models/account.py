from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.data.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # ## NEW: The 10-digit identity from our ledger tools.
    # ## Unique=True ensures no two Misters ever share the same account number.
    account_number = Column(String(10), unique=True, index=True, nullable=False)
    
    # ## Supporting USDT/BTC as planned
    currency = Column(String, default="USDT", nullable=False)
    
    # ## IMPROVEMENT: Using Numeric/Decimal instead of Float for precision banking.
    # ## This ensures we never lose a single cent to rounding errors, Mister.
    balance = Column(Numeric(precision=18, scale=2), default=0.0)
    
    # ## If this is False, no money moves out of this specific pocket
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Back-reference to the owner
    user = relationship("User", back_populates="accounts")