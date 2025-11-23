from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..schemas.ticket import TicketTypeCreate, TicketTypeResponse
from ..models.ticket import TicketType
from ..utils.auth import require_auth


router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("/types", response_model=TicketTypeResponse)
async def create_ticket_type(
    ticket: TicketTypeCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_auth)
):
    db_ticket = TicketType(**ticket.dict())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


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
    quantity: int,
    db: Session = Depends(get_db)
):
    """
    Check availability of tickets for a specific ticket type.
    
    Args:
        event_id: ID of the event
        ticket_type_id: ID of the ticket type
        quantity: Number of tickets requested
        
    Returns:
        Dict with available status and remaining tickets
    """
    from ..models.ticket import Ticket, TicketType
    
    # Get ticket type
    ticket_type = db.query(TicketType).filter(
        TicketType.id == ticket_type_id,
        TicketType.event_id == event_id
    ).first()
    
    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    
    # Count tickets already sold for this ticket type
    tickets_sold = db.query(Ticket).filter(
        Ticket.ticket_type_id == ticket_type_id,
        Ticket.status == "valid"
    ).count()
    
    # Calculate available tickets
    total_quantity = ticket_type.quantity
    available_quantity = total_quantity - tickets_sold
    remaining_tickets = max(0, available_quantity)
    
    # Check if requested quantity is available
    is_available = remaining_tickets >= quantity
    
    return {
        "available": is_available,
        "remainingTickets": remaining_tickets,
        "requestedQuantity": quantity,
        "totalQuantity": total_quantity,
        "ticketsSold": tickets_sold
    }


