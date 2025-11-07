from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    user_type: Literal["admin", "organizer", "buyer"]
    status: Optional[Literal["active", "inactive", "suspended"]] = None
    organization_name: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    user_type: Optional[Literal["admin", "organizer", "buyer"]] = None
    status: Optional[Literal["active", "inactive", "suspended"]] = None
    organization_name: Optional[str] = None


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


