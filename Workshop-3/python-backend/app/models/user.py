from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from .base import BaseModel
import enum

class UserType(str, enum.Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"
    BUYER = "buyer"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(BaseModel):
    __tablename__ = "users"

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(20))
    user_type = Column(SQLEnum(UserType), nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE)
    last_login = Column(DateTime, nullable=True)
    organization_name = Column(String(150), nullable=True)  # For EventOrganizer
