from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.sql import func
from app.data.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)

    # ## Add these specific string columns to your Transaction class, Mister.
    sender_no = Column(String, nullable=True)
    receiver_no = Column(String, nullable=True) # Nullable for external/crypto
    
    # ## Core Accounts
    sender_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    receiver_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True) # ## Nullable for External/Crypto
    
    # ## Money (Upgraded to Numeric for Decimal precision)
    amount = Column(Numeric(20, 8), nullable=False)
    fee = Column(Numeric(20, 8), default=0.0)
    currency = Column(String, nullable=False, default="USDT")
    
    # ## External/Overseas Details (The new 'Pockets', Mister)
    transfer_type = Column(String, default="internal") # 'internal' or 'external'
    external_bank_name = Column(String, nullable=True)
    external_swift_bic = Column(String, nullable=True)
    external_iban_or_acc = Column(String, nullable=True)
    recipient_full_name = Column(String, nullable=True)
    recipient_address = Column(Text, nullable=True)
    purpose_of_transfer = Column(String, nullable=True)
    
    # ## Metadata & Control
    status = Column(String, default="pending") # pending, success, failed, blocked, reversed
    is_reversible = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    
    # ## Audit Trail
    reversed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reversed_at = Column(DateTime(timezone=True), nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())