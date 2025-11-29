"""
Notification Service
Handles creation and management of notifications
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from ..models.notification import Notification, NotificationType
from ..models.order import Order
from ..models.payment import Payment


class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        message: str
    ) -> Notification:
        """Create a new notification"""
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            message=message,
            sent_at=datetime.utcnow(),
            is_read=False
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @classmethod
    def notify_payment_success(cls, db: Session, payment: Payment, order: Order) -> Notification:
        """Create notification for successful payment"""
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.PAYMENT_SUCCESS,
            message=f"Payment Successful! Your payment of ${payment.amount} COP for order #{order.id} has been processed successfully. Your tickets are confirmed!"
        )
    
    @classmethod
    def notify_payment_failed(cls, db: Session, payment: Payment, order: Order) -> Notification:
        """Create notification for failed payment"""
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.PAYMENT_FAILED,
            message=f"Payment Failed. Your payment for order #{order.id} could not be processed. Reason: {payment.error_message or 'Unknown error'}. Please try again."
        )
    
    @classmethod
    def notify_refund_requested(cls, db: Session, order: Order) -> Notification:
        """Create notification for organizer when refund is requested"""
        # Import here to avoid circular dependency
        from ..models.event import Event
        
        # Get the event from database
        event = db.query(Event).filter(Event.id == order.event_id).first()
        if not event or not event.organizer_id:
            return None
            
        return cls.create_notification(
            db=db,
            user_id=event.organizer_id,
            notification_type=NotificationType.REFUND_REQUESTED,
            message=f"Refund Request Received. User has requested a refund for order #{order.id}. Reason: {order.refund_reason}. Please review and respond."
        )
    
    @classmethod
    def notify_refund_approved(cls, db: Session, order: Order) -> Notification:
        """Create notification for user when refund is approved"""
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.REFUND_APPROVED,
            message=f"Refund Approved. Your refund request for order #{order.id} has been approved. The amount of ${order.total_amount} COP will be refunded to your original payment method."
        )
    
    @classmethod
    def notify_refund_rejected(cls, db: Session, order: Order, rejection_reason: Optional[str] = None) -> Notification:
        """Create notification for user when refund is rejected"""
        message = f"Refund Request Rejected. Your refund request for order #{order.id} has been rejected."
        if rejection_reason:
            message += f" Reason: {rejection_reason}"
            
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.REFUND_REJECTED,
            message=message
        )
