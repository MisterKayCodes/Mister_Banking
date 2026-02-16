from pydantic import BaseModel

class UserCreate(BaseModel):
    full_name: str
    email: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True
