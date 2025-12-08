"""
Schemas for notifications
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: str
    title: str
    message: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Schema for creating notifications"""
    user_id: int


class NotificationResponse(NotificationBase):
    """Schema for notification responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class NotificationMarkRead(BaseModel):
    """Schema for marking notification as read"""
    notification_ids: list[int] = Field(..., description="List of notification IDs to mark as read")


class NotificationStats(BaseModel):
    """Schema for notification statistics"""
    total: int
    unread: int
    read: int
