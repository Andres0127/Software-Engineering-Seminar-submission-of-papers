"""
API routes for notifications
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..core.database import get_db
from ..models.notification import Notification
from ..schemas.notification import (
    NotificationResponse,
    NotificationMarkRead,
    NotificationStats
)
from ..utils.auth import get_current_user_id


router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get current user's notifications
    """
    query = db.query(Notification).filter(Notification.user_id == current_user_id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get notification statistics for current user
    """
    total = db.query(func.count(Notification.id)).filter(
        Notification.user_id == current_user_id
    ).scalar()
    
    unread = db.query(func.count(Notification.id)).filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).scalar()
    
    return NotificationStats(
        total=total,
        unread=unread,
        read=total - unread
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get specific notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification


@router.post("/mark-read", response_model=dict)
async def mark_notifications_as_read(
    payload: NotificationMarkRead,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Mark notifications as read
    """
    notifications = db.query(Notification).filter(
        Notification.id.in_(payload.notification_ids),
        Notification.user_id == current_user_id
    ).all()
    
    if not notifications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No notifications found"
        )
    
    for notification in notifications:
        notification.mark_as_read()
    
    db.commit()
    
    return {
        "success": True,
        "marked_count": len(notifications)
    }


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_single_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Mark single notification as read
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.mark_as_read()
    db.commit()
    db.refresh(notification)
    
    return notification


@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Mark all user's notifications as read
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).all()
    
    for notification in notifications:
        notification.mark_as_read()
    
    db.commit()
    
    return {
        "success": True,
        "marked_count": len(notifications)
    }


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Delete a notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"success": True, "message": "Notification deleted"}
