from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.sql import func
from app.data.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)

    # ## String columns for quick lookup without heavy joins
    sender_no = Column(String, nullable=True)
    receiver_no = Column(String, nullable=True) 
    
    # ## Core Account Links
    sender_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    receiver_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True) 
    
    # ## Precision Money (Matches your Satoshi requirements, Administrator)
    amount = Column(Numeric(20, 8), nullable=False)
    fee = Column(Numeric(20, 8), default=0.0)
    currency = Column(String, nullable=False, default="USD")
    
    # ## NEW: The Ledger Notes
    # ## this prevents your long crypto receipts from being cut off.
    details = Column(Text, nullable=True) 

    # ## External/Overseas Details
    transfer_type = Column(String, default="internal") 
    external_bank_name = Column(String, nullable=True)
    external_swift_bic = Column(String, nullable=True)
    external_iban_or_acc = Column(String, nullable=True)
    recipient_full_name = Column(String, nullable=True)
    recipient_address = Column(Text, nullable=True)
    purpose_of_transfer = Column(String, nullable=True)
    
    # ## Status & Admin Oversight
    status = Column(String, default="pending")
    # Bridge integration fields
    confirmations = Column(Integer, default=0, nullable=False)
    bridge_transfer_id = Column(String(255), nullable=True, unique=True)
    is_bridge = Column(Boolean, default=False)
    is_reversible = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    
    # ## The Audit Trail
    reversed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reversed_at = Column(DateTime(timezone=True), nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())