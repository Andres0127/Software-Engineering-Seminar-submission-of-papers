"""
Notification Service
Handles creation and management of notifications
"""
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime

from ..models.notification import Notification, NotificationType
from ..models.order import Order
from ..models.payment import Payment
from ..models.user import User


class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[int] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """Create a new notification"""
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            data=data,
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
            title="Payment Successful! 🎉",
            message=f"Your payment of ${payment.amount} COP for order #{order.id} has been processed successfully. Your tickets are confirmed!",
            related_entity_type="payment",
            related_entity_id=payment.id,
            data={
                "order_id": order.id,
                "payment_id": payment.id,
                "amount": float(payment.amount),
                "transaction_id": payment.transaction_id
            }
        )
    
    @classmethod
    def notify_payment_failed(cls, db: Session, payment: Payment, order: Order) -> Notification:
        """Create notification for failed payment"""
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.PAYMENT_FAILED,
            title="Payment Failed ❌",
            message=f"Your payment for order #{order.id} could not be processed. Reason: {payment.error_message or 'Unknown error'}. Please try again.",
            related_entity_type="payment",
            related_entity_id=payment.id,
            data={
                "order_id": order.id,
                "payment_id": payment.id,
                "amount": float(payment.amount),
                "error_code": payment.error_code,
                "error_message": payment.error_message
            }
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
            title="Refund Request Received 💰",
            message=f"User has requested a refund for order #{order.id}. Reason: {order.refund_reason}. Please review and respond.",
            related_entity_type="order",
            related_entity_id=order.id,
            data={
                "order_id": order.id,
                "buyer_id": order.buyer_id,
                "event_id": event.id,
                "event_name": event.name,
                "amount": float(order.total_amount),
                "refund_reason": order.refund_reason
            }
        )
    
    @classmethod
    def notify_refund_approved(cls, db: Session, order: Order) -> Notification:
        """Create notification for user when refund is approved"""
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.REFUND_APPROVED,
            title="Refund Approved ✅",
            message=f"Your refund request for order #{order.id} has been approved. The amount of ${order.total_amount} COP will be refunded to your original payment method.",
            related_entity_type="order",
            related_entity_id=order.id,
            data={
                "order_id": order.id,
                "amount": float(order.total_amount)
            }
        )
    
    @classmethod
    def notify_refund_rejected(cls, db: Session, order: Order, rejection_reason: Optional[str] = None) -> Notification:
        """Create notification for user when refund is rejected"""
        message = f"Your refund request for order #{order.id} has been rejected."
        if rejection_reason:
            message += f" Reason: {rejection_reason}"
            
        return cls.create_notification(
            db=db,
            user_id=order.buyer_id,
            notification_type=NotificationType.REFUND_REJECTED,
            title="Refund Request Rejected ❌",
            message=message,
            related_entity_type="order",
            related_entity_id=order.id,
            data={
                "order_id": order.id,
                "rejection_reason": rejection_reason
            }
        )
