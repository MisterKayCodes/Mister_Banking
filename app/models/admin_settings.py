from sqlalchemy import Column, Integer, Float, Boolean
from app.data.database import Base

class AdminSettings(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    transfer_fee_percent = Column(Float, default=0.0)
    instant_transfer_fee_percent = Column(Float, default=0.0)
    crypto_buy_enabled = Column(Boolean, default=True)
