from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.event import Event
from ..models.location import Location
from ..models.order import Order
from ..models.ticket import Ticket, TicketType
from ..schemas.ticket import BuyerTicketResponse, TicketTypeCreate, TicketTypeResponse
from ..utils.auth import (
    get_current_user_id,
    require_buyer_or_admin,
    require_organizer_or_admin,
)

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post(
    "/types",
    response_model=TicketTypeResponse,
    dependencies=[Depends(require_organizer_or_admin)],
)
async def create_ticket_type(ticket: TicketTypeCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == ticket.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    new_ticket_type = TicketType(**ticket.dict())
    db.add(new_ticket_type)
    db.commit()
    db.refresh(new_ticket_type)
    return new_ticket_type


@router.get("/types/{ticket_type_id}", response_model=TicketTypeResponse)
async def get_ticket_type(ticket_type_id: int, db: Session = Depends(get_db)):
    ticket = db.query(TicketType).filter(TicketType.id == ticket_type_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    return ticket


@router.get("/event/{event_id}/types", response_model=List[TicketTypeResponse])
async def get_event_ticket_types(event_id: int, db: Session = Depends(get_db)):
    tickets = db.query(TicketType).filter(TicketType.event_id == event_id).all()
    return tickets


@router.get("/event/{event_id}/types/{ticket_type_id}/availability")
async def check_ticket_availability(
    event_id: int,
    ticket_type_id: int,
    quantity: int = Query(..., gt=0),
    db: Session = Depends(get_db),
):
    ticket_type = db.query(TicketType).filter(
        TicketType.id == ticket_type_id,
        TicketType.event_id == event_id,
    ).first()

    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")

    tickets_sold = db.query(func.coalesce(func.sum(Order.quantity), 0)).filter(
        Order.ticket_type_id == ticket_type_id,
        Order.status.in_(["pending", "confirmed"]),
    ).scalar() or 0

    total_quantity = ticket_type.quantity
    remaining_tickets = max(0, total_quantity - int(tickets_sold))
    is_available = remaining_tickets >= quantity

    return {
        "available": is_available,
        "remainingTickets": remaining_tickets,
        "requestedQuantity": quantity,
        "totalQuantity": total_quantity,
    }


@router.get(
    "/my-tickets",
    response_model=List[BuyerTicketResponse],
    dependencies=[Depends(require_buyer_or_admin)],
)
async def get_my_tickets(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    records = (
        db.query(Ticket, TicketType, Event, Order, Location)
        .join(Order, Ticket.order_id == Order.id)
        .join(TicketType, Ticket.ticket_type_id == TicketType.id)
        .join(Event, TicketType.event_id == Event.id)
        .outerjoin(Location, Event.location_id == Location.id)
        .filter(Order.buyer_id == current_user_id)
        .order_by(Ticket.id.desc())
        .all()
    )

    result = []
    for ticket, ticket_type, event, order, location in records:
        result.append(
            BuyerTicketResponse(
                id=ticket.id,
                qr_code=ticket.qr_code,
                status=ticket.status,
                ticket_type_id=ticket_type.id,
                ticket_type_name=ticket_type.name,
                ticket_price=float(ticket_type.price or 0),
                event_id=event.id,
                event_title=event.name,
                event_start=event.date,
                location_name=location.name if location else None,
                order_id=order.id,
                order_number=order.order_number,
            )
        )

    return result


