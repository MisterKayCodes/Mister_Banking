from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SupportMessageCreate(BaseModel):
    subject: str
    message: str

class SupportReply(BaseModel):
    message: str

class SupportMessageResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    is_from_admin: bool
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True