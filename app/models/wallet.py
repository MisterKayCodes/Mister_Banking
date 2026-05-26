from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.data.database import Base

class Wallet(Base):
    """
    this is the dedicated Crypto Vault. 
    It handles the high-precision math that Bitcoin requires.
    """
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # ## Realistic Addresses (Admin-editable as requested)
    # ## these will look like 'bc1...' or '0x...'
    btc_address = Column(String, unique=True, index=True, nullable=True)
    usdt_address = Column(String, unique=True, index=True, nullable=True)

    # ## BTC needs scale=8 for 'Satoshi' precision. 
    # ## USDT stays at scale=2 like the dollar.
    btc_balance = Column(Numeric(precision=18, scale=8), default=0.0)
    usdt_balance = Column(Numeric(precision=18, scale=2), default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ## Linking back to the User
    user = relationship("User", back_populates="wallet")