from sqlalchemy import Column, Integer, String, Float, Boolean
from app.data.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # link to User
    currency = Column(String, default="USD")  # USD or BTC
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)  # can admin block/unblock
