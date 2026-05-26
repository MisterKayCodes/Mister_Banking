from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.data.database import Base

class User(Base):
    __tablename__ = "users"

    # ## The unique identifier for every user in our bank.
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    date_of_birth = Column(String, nullable=True)
    
    # ## Security hashes. We never store the actual keys.
    password_hash = Column(String, nullable=True)
    pin_hash = Column(String, nullable=True)
    
    # ## System's Admin and Status flags. 
    # ## is_admin = True gives the 'Founder' total control.
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True) 
    
    # ## Possible values: 'unverified', 'pending', 'verified'
    # ## This allows for instant checks during high-value transfers.
    kyc_status = Column(String, default="unverified")
    
    # ## NEW: Trading Oversight.
    # ## sometimes the market is too hot for some users. 
    # ## This lets you cool them down with a specific explanation.
    trading_blocked = Column(Boolean, default=False)
    trading_block_reason = Column(String, nullable=True)

    # ## Tracking when they joined the elite.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Linking the vault to the owner.
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    support_messages = relationship("SupportMessage", back_populates="user", cascade="all, delete-orphan")
    
    # ## NEW: Linking the user to their KYC evidence folder.
    kyc_submissions = relationship("KYCSubmission", back_populates="user", cascade="all, delete-orphan")

    # ## NEW: The direct link to the user's notification history.
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    # RIGHT: The User HAS a wallet.
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
