from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.data.database import Base

class User(Base):
    __tablename__ = "users"

    # ## The unique identifier for every citizen in our bank.
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # ## Security hashes. We never store the actual keys, Mister.
    password_hash = Column(String, nullable=False)
    pin_hash = Column(String, nullable=True)
    
    # ## Mister's Admin and Status flags. 
    # ## is_admin = True gives the 'Founder' total control.
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True) 
    
    # ## NEW: The KYC Gateway.
    # ## Possible values: 'unverified', 'pending', 'verified'
    # ## This allows for instant checks during high-value transfers.
    kyc_status = Column(String, default="unverified")

    # ## Tracking when they joined the elite.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Linking the vault to the owner.
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    support_messages = relationship("SupportMessage", back_populates="user", cascade="all, delete-orphan")
    
    # ## NEW: Linking the citizen to their KYC evidence folder.
    kyc_submissions = relationship("KYCSubmission", back_populates="user", cascade="all, delete-orphan")

    # ## NEW: The direct link to the citizen's notification history.
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")