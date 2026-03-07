from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.data.database import Base

class KYCRequirement(Base):
    """
    this is your Rulebook.
    Add 'Passport', 'Utility Bill', or 'Tax ID' here.
    """
    __tablename__ = "kyc_requirements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True) # e.g., "Passport"
    description = Column(Text, nullable=True)         # e.g., "High-res scan of the photo page"
    is_required = Column(Boolean, default=True)       # Can they skip this?
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Linking to the actual files users will upload
    submissions = relationship("KYCSubmission", back_populates="requirement", cascade="all, delete-orphan")


class KYCSubmission(Base):
    """
    this is the User's Proof.
    Every row here is one document uploaded by a user.
    """
    __tablename__ = "kyc_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("kyc_requirements.id"), nullable=False)
    
    document_url = Column(String, nullable=False)    # The path to the file
    status = Column(String, default="pending")       # pending, approved, rejected
    admin_comment = Column(String, nullable=True)    # "System says: This photo is blurry"
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Handshakes
    user = relationship("User")
    requirement = relationship("KYCRequirement", back_populates="submissions")