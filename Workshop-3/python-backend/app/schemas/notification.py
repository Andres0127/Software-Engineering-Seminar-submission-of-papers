"""
Schemas for notifications
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: str
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    """Schema for creating notifications"""
    user_id: int


class NotificationResponse(NotificationBase):
    """Schema for notification responses"""
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    """Schema for marking notification as read"""
    notification_ids: list[int] = Field(..., description="List of notification IDs to mark as read")


class NotificationStats(BaseModel):
    """Schema for notification statistics"""
    total: int
    unread: int
    read: int
