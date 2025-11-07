from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..schemas.ticket import TicketTypeCreate, TicketTypeResponse
from ..models.ticket import TicketType


router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("/types", response_model=TicketTypeResponse)
async def create_ticket_type(ticket: TicketTypeCreate, db: Session = Depends(get_db)):
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


