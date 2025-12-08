from datetime import datetime
from decimal import Decimal
from typing import List
from uuid import uuid4
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.event import Event
from ..models.order import Order
from ..models.ticket import Ticket, TicketType
from ..schemas.order import OrderCreate, OrderPayment, OrderRefundRequest, OrderResponse
from ..services.notification_service import NotificationService
from ..utils.auth import get_current_user_id, get_current_user_role, require_buyer, require_organizer_or_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _sum_order_quantities(db: Session, event_id: int, ticket_type_id: int, statuses: List[str]) -> int:
    result = db.query(func.coalesce(func.sum(Order.quantity), 0)).filter(
        Order.event_id == event_id,
        Order.ticket_type_id == ticket_type_id,
        Order.status.in_(statuses),
    ).scalar()
    return int(result or 0)


def _sum_event_quantities(db: Session, event_id: int, statuses: List[str]) -> int:
    result = db.query(func.coalesce(func.sum(Order.quantity), 0)).filter(
        Order.event_id == event_id,
        Order.status.in_(statuses),
    ).scalar()
    return int(result or 0)


@router.post(
    "/",
    response_model=OrderResponse,
    dependencies=[Depends(require_buyer)],
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    # Log the incoming payload for debugging
    logger.info(f"Creating order - event_id: {payload.event_id}, ticket_type_id: {payload.ticket_type_id}, quantity: {payload.quantity}, user_id: {current_user_id}")
    
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        logger.warning(f"Event not found: {payload.event_id}")
        raise HTTPException(status_code=404, detail="Event not found")

    event_status = (event.event_status or "draft").upper()
    logger.info(f"Event status: {event_status}, Event date: {event.date}")
    
    if event_status != "PUBLISHED":
        logger.warning(f"Event {payload.event_id} is not published. Status: {event_status}")
        raise HTTPException(
            status_code=400,
            detail=f"Tickets can only be purchased for published events. Current status: {event_status}",
        )

    if event.date and event.date < datetime.utcnow():
        event_date_str = event.date.strftime("%Y-%m-%d %H:%M:%S") if event.date else "N/A"
        logger.warning(f"Event {payload.event_id} has already started. Date: {event_date_str}, Current: {datetime.utcnow()}")
        raise HTTPException(
            status_code=400,
            detail=f"El evento ya ha comenzado o las ventas de boletos están cerradas. Fecha del evento: {event_date_str}",
        )

    ticket_type = (
        db.query(TicketType)
        .filter(TicketType.id == payload.ticket_type_id)
        .first()
    )
    if not ticket_type or ticket_type.event_id != event.id:
        raise HTTPException(status_code=404, detail="Ticket type not found for this event")

    requested_quantity = payload.quantity
    sold_items = _sum_order_quantities(db, event.id, ticket_type.id, ["pending", "confirmed"])
    remaining = ticket_type.quantity - sold_items
    if remaining < requested_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {max(0, remaining)} tickets left for this type.",
        )

    if event.max_tickets_per_purchase and requested_quantity > event.max_tickets_per_purchase:
        raise HTTPException(
            status_code=400,
            detail=f"The purchase limit is {event.max_tickets_per_purchase} tickets.",
        )

    if event.capacity and event.capacity > 0:
        sold_event = _sum_event_quantities(db, event.id, ["pending", "confirmed"])
        remaining_capacity = event.capacity - sold_event
        if remaining_capacity < requested_quantity:
            raise HTTPException(
                status_code=400,
                detail="There is not enough capacity for that quantity at the event.",
            )

    total_amount = Decimal(ticket_type.price) * Decimal(requested_quantity)
    order_number = f"ORD-{datetime.utcnow():%Y%m%d}-{uuid4().hex[:6].upper()}"

    order = Order(
        order_number=order_number,
        purchase_date=datetime.utcnow(),
        status="pending",
        total_amount=total_amount,
        buyer_id=current_user_id,
        event_id=event.id,
        ticket_type_id=ticket_type.id,
        quantity=requested_quantity,
    )

    db.add(order)
    db.flush()

    for _ in range(requested_quantity):
        ticket = Ticket(
            ticket_type_id=ticket_type.id,
            qr_code=uuid4().hex,
            order_id=order.id,
            status="PENDING",
        )
        db.add(ticket)

    db.commit()
    db.refresh(order)

    return order


@router.post(
    "/{order_id}/payment",
    response_model=OrderResponse,
    dependencies=[Depends(require_buyer)],
)
async def confirm_order_payment(
    order_id: int,
    payment: OrderPayment,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this order")

    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Order payment cannot be processed again",
        )

    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()

    required_quantity = order.quantity or 0
    missing_tickets = required_quantity - len(tickets)
    for _ in range(max(0, missing_tickets)):
        new_ticket = Ticket(
            ticket_type_id=order.ticket_type_id,
            qr_code=uuid4().hex,
            order_id=order.id,
            status="PENDING",
        )
        db.add(new_ticket)
        tickets.append(new_ticket)

    for ticket in tickets:
        ticket.status = "CONFIRMED"

    order.status = "confirmed"
    order.expiration_date = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return order


@router.post(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    dependencies=[Depends(require_buyer)],
)
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this order")

    if (order.status or "").upper() != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending orders can be cancelled",
        )

    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
    for ticket in tickets:
        ticket.status = "CANCELLED"

    order.status = "CANCELLED"
    order.refund_reason = None

    db.commit()
    db.refresh(order)

    return order


@router.post(
    "/{order_id}/refund",
    response_model=OrderResponse,
    dependencies=[Depends(require_buyer)],
)
async def request_order_refund(
    order_id: int,
    payload: OrderRefundRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this order")

    if (order.status or "").upper() != "CONFIRMED":
        raise HTTPException(
            status_code=400,
            detail="Only confirmed orders can be refunded",
        )

    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
    for ticket in tickets:
        ticket.status = "CANCELLED"

    order.status = "REFUND_REQUESTED"
    order.refund_reason = payload.reason.strip()

    db.commit()
    db.refresh(order)
    
    # Create notification for organizer
    NotificationService.notify_refund_requested(db, order)

    return order


@router.get(
    "/my-orders",
    response_model=List[OrderResponse],
    dependencies=[Depends(require_buyer)],
)
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    orders = (
        db.query(Order)
        .filter(Order.buyer_id == current_user_id)
        .order_by(Order.purchase_date.desc())
        .all()
    )
    return orders


@router.get("/refund-requests")
async def get_refund_requests(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """Get all refund requests for events organized by the current user"""
    try:
        # Get all events organized by the current user
        organizer_events = db.query(Event.id).filter(Event.organizer_id == current_user_id).all()
        event_ids = [event.id for event in organizer_events]
        
        if not event_ids:
            return JSONResponse(content=[])
        
        # Get all orders with refund_requested status for these events
        refund_requests = (
            db.query(Order)
            .filter(
                Order.event_id.in_(event_ids),
                Order.status == "REFUND_REQUESTED"
            )
            .order_by(Order.updated_at.desc())
            .all()
        )
        
        # Convert to dictionaries manually to avoid Pydantic validation issues
        result = []
        for order in refund_requests:
            order_dict = {
                "id": order.id,
                "order_number": order.order_number,
                "purchase_date": order.purchase_date.isoformat() if order.purchase_date else None,
                "expiration_date": order.expiration_date.isoformat() if order.expiration_date else None,
                "status": order.status,
                "total_amount": float(order.total_amount) if order.total_amount else 0.0,
                "buyer_id": order.buyer_id,
                "event_id": order.event_id,
                "ticket_type_id": order.ticket_type_id,
                "quantity": order.quantity,
                "refund_reason": order.refund_reason,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            }
            result.append(order_dict)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this order")

    return order


@router.post(
    "/{order_id}/refund/approve",
    response_model=OrderResponse,
)
async def approve_refund(
    order_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Approve a refund request (Organizer only)
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user is the organizer of the event
    event = db.query(Event).filter(Event.id == order.event_id).first()
    if not event or event.organizer_id != current_user_id:
        raise HTTPException(
            status_code=403, 
            detail="Only the event organizer can approve refunds"
        )

    if (order.status or "").upper() != "REFUND_REQUESTED":
        raise HTTPException(
            status_code=400,
            detail="Order is not in refund requested status",
        )

    # Update order status
    order.status = "REFUNDED"
    
    # Cancel tickets (use CANCELLED since REFUNDED doesn't exist in ticket status enum)
    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
    for ticket in tickets:
        ticket.status = "CANCELLED"

    db.commit()
    db.refresh(order)
    
    # Create notification for buyer
    NotificationService.notify_refund_approved(db, order)

    return order


@router.post(
    "/{order_id}/refund/reject",
    response_model=OrderResponse,
)
async def reject_refund(
    order_id: int,
    rejection_reason: str = None,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Reject a refund request (Organizer only)
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user is the organizer of the event
    event = db.query(Event).filter(Event.id == order.event_id).first()
    if not event or event.organizer_id != current_user_id:
        raise HTTPException(
            status_code=403, 
            detail="Only the event organizer can reject refunds"
        )

    if (order.status or "").upper() != "REFUND_REQUESTED":
        raise HTTPException(
            status_code=400,
            detail="Order is not in refund requested status",
        )

    # Revert to confirmed status
    order.status = "CONFIRMED"
    order.refund_reason = None
    
    # Update tickets back to confirmed
    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
    for ticket in tickets:
        ticket.status = "CONFIRMED"

    db.commit()
    db.refresh(order)
    
    # Create notification for buyer
    NotificationService.notify_refund_rejected(db, order, rejection_reason)

    return order


@router.get("/dashboard/debug")
async def debug_dashboard_data(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """Debug endpoint to check raw data"""
    # Get events for current user
    events = db.query(Event).filter(Event.organizer_id == current_user_id).all()
    event_ids = [e.id for e in events]
    
    # Get all orders for these events
    orders = db.query(Order).filter(Order.event_id.in_(event_ids)).all()
    
    return {
        "current_user_id": current_user_id,
        "events_count": len(events),
        "event_ids": event_ids,
        "events": [{"id": e.id, "name": e.name, "organizer_id": e.organizer_id} for e in events],
        "orders_count": len(orders),
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "status": o.status,
                "event_id": o.event_id,
                "buyer_id": o.buyer_id,
                "quantity": o.quantity,
                "total_amount": float(o.total_amount) if o.total_amount else 0
            }
            for o in orders
        ]
    }


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role),
):
    """Get dashboard statistics for organizer or admin"""
    try:
        # For ADMIN, show all events. For ORGANIZER, show only their events
        is_admin = current_user_role == "ROLE_ADMIN"
        
        if is_admin:
            # Get all PUBLISHED events for admin (consistent with EventsPage)
            # Use case-insensitive comparison to handle both "published" and "PUBLISHED"
            all_events = db.query(Event).filter(
                func.lower(Event.event_status) == "published"
            ).all()
            event_ids = [event.id for event in all_events]
        else:
            # Get all PUBLISHED events for this organizer
            organizer_events = db.query(Event).filter(
                Event.organizer_id == current_user_id,
                func.lower(Event.event_status) == "published"
            ).all()
            event_ids = [event.id for event in organizer_events]
            all_events = organizer_events
        
        if not event_ids:
            return JSONResponse(content={
                "totalRevenue": 0,
                "totalEvents": 0,
                "totalTicketsSold": 0,
                "activeEvents": 0,
                "revenueByEvent": [],
                "salesOverTime": [],
                "ticketTypeDistribution": [],
                "orderStatusDistribution": [],
                "recentEvents": []
            })
        
        # Calculate total revenue from confirmed orders
        total_revenue = db.query(func.sum(Order.total_amount)).filter(
            Order.event_id.in_(event_ids),
            Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"])
        ).scalar() or 0
        
        # Count total tickets sold
        total_tickets = db.query(func.sum(Order.quantity)).filter(
            Order.event_id.in_(event_ids),
            Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"])
        ).scalar() or 0
        
        # Count active events (not expired and published)
        if is_admin:
            active_events = db.query(func.count(Event.id)).filter(
                func.lower(Event.event_status) == "published",
                Event.end_date >= datetime.now()
            ).scalar() or 0
        else:
            active_events = db.query(func.count(Event.id)).filter(
                Event.organizer_id == current_user_id,
                func.lower(Event.event_status) == "published",
                Event.end_date >= datetime.now()
            ).scalar() or 0
        
        # Revenue by event
        revenue_by_event_base_query = db.query(
            Event.name,
            func.sum(Order.total_amount).label('revenue')
        ).join(Order, Event.id == Order.event_id).filter(
            Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"])
        )
        
        if not is_admin:
            revenue_by_event_base_query = revenue_by_event_base_query.filter(
                Event.organizer_id == current_user_id
            )
        
        revenue_by_event_query = revenue_by_event_base_query.group_by(Event.id, Event.name).order_by(func.sum(Order.total_amount).desc()).limit(10).all()
        
        revenue_by_event = [
            {"eventName": row.name, "revenue": float(row.revenue or 0)}
            for row in revenue_by_event_query
        ]
        
        # Sales over time (last 30 days)
        sales_over_time_query = db.query(
            func.date(Order.purchase_date).label('date'),
            func.sum(Order.total_amount).label('revenue'),
            func.count(Order.id).label('orders')
        ).filter(
            Order.event_id.in_(event_ids),
            Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"]),
            Order.purchase_date >= datetime.now().replace(day=1)  # Current month
        ).group_by(func.date(Order.purchase_date)).order_by(func.date(Order.purchase_date)).all()
        
        sales_over_time = [
            {
                "date": row.date.isoformat() if row.date else None,
                "revenue": float(row.revenue or 0),
                "orders": int(row.orders or 0)
            }
            for row in sales_over_time_query
        ]
        
        # Ticket type distribution
        ticket_distribution_query = db.query(
            TicketType.name,
            func.sum(Order.quantity).label('quantity'),
            func.sum(Order.total_amount).label('revenue')
        ).join(Order, TicketType.id == Order.ticket_type_id).filter(
            Order.event_id.in_(event_ids),
            Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"])
        ).group_by(TicketType.id, TicketType.name).all()
        
        ticket_type_distribution = [
            {
                "ticketType": row.name,
                "quantity": int(row.quantity or 0),
                "revenue": float(row.revenue or 0)
            }
            for row in ticket_distribution_query
        ]
        
        # Order status distribution
        status_distribution_query = db.query(
            Order.status,
            func.count(Order.id).label('count')
        ).filter(
            Order.event_id.in_(event_ids)
        ).group_by(Order.status).all()
        
        order_status_distribution = [
            {"status": row.status, "count": int(row.count or 0)}
            for row in status_distribution_query
        ]
        
        # Recent events with metrics - order by most recent
        sorted_events = sorted(all_events, key=lambda e: e.created_at if e.created_at else datetime.min, reverse=True)
        recent_events = []
        for event in sorted_events[:10]:  # Last 10 events
            event_orders = db.query(Order).filter(
                Order.event_id == event.id,
                Order.status.in_(["confirmed", "CONFIRMED", "refund_requested", "REFUND_REQUESTED"])
            ).all()
            
            event_revenue = sum(float(order.total_amount or 0) for order in event_orders)
            event_tickets = sum(int(order.quantity or 0) for order in event_orders)
            
            recent_events.append({
                "id": event.id,
                "title": event.name,
                "startDate": event.date.isoformat() if event.date else None,
                "endDate": event.end_date.isoformat() if event.end_date else None,
                "revenue": event_revenue,
                "ticketsSold": event_tickets,
                "status": "ACTIVE" if event.end_date and event.end_date >= datetime.now() else "FINISHED"
            })
        
        return JSONResponse(content={
            "totalRevenue": float(total_revenue),
            "totalEvents": len(all_events),
            "totalTicketsSold": int(total_tickets),
            "activeEvents": int(active_events),
            "revenueByEvent": revenue_by_event,
            "salesOverTime": sales_over_time,
            "ticketTypeDistribution": ticket_type_distribution,
            "orderStatusDistribution": order_status_distribution,
            "recentEvents": recent_events
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
