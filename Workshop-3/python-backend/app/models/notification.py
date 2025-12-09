from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from .base import BaseModel
from datetime import datetime

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # payment_success, payment_failed, refund_requested, refund_approved, refund_rejected
    title = Column(String(200), nullable=False)  # Title for the notification
    message = Column(Text)  # Nullable to match database schema
    read_at = Column(DateTime)  # Matches database schema (read_at instead of sent_at)
    is_read = Column(Boolean, default=False)
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        if not self.read_at:
            self.read_at = datetime.utcnow()

class NotificationType:
    """Notification types"""
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    REFUND_REQUESTED = "refund_requested"
    REFUND_APPROVED = "refund_approved"
    REFUND_REJECTED = "refund_rejected"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_CANCELLED = "order_cancelled"

