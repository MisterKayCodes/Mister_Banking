from sqlalchemy import Column, String
from app.data.database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"

    # ## The unique identifier for the rule. No duplicates allowed in System's house.
    key = Column(String, primary_key=True, index=True)
    
    # ## We store everything as a string and cast it on the fly for maximum flexibility.
    value = Column(String, nullable=False)
    
    # ## A little reminder for the admin on what this dial actually turns.
    description = Column(String, default="")