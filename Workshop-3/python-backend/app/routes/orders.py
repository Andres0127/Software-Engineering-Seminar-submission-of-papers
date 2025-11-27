from datetime import datetime
from decimal import Decimal
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.event import Event
from ..models.order import Order
from ..models.ticket import Ticket, TicketType
from ..schemas.order import OrderCreate, OrderPayment, OrderResponse
from ..utils.auth import get_current_user_id, require_buyer_or_admin

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
    dependencies=[Depends(require_buyer_or_admin)],
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if (event.event_status or "draft").upper() != "PUBLISHED":
        raise HTTPException(
            status_code=400,
            detail="Tickets can only be purchased for published events.",
        )

    if event.date and event.date < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="The event has already started or ticket sales are closed.",
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
    dependencies=[Depends(require_buyer_or_admin)],
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


@router.get(
    "/my-orders",
    response_model=List[OrderResponse],
    dependencies=[Depends(require_buyer_or_admin)],
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


