from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    date_of_birth: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]{4}$", description="Strictly a 4-digit numerical PIN.")


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)


class SuspendedUserResponse(BaseModel):
    email: str
    message: str = "Your account has been suspended due to suspicious activities. Please contact support for assistance."
