from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Enum as SQLEnum
from .base import BaseModel
import enum

class NotificationType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(SQLEnum(NotificationType), nullable=False)
    message = Column(String(500))
    sent_at = Column(DateTime)
    is_read = Column(Boolean, default=False)
