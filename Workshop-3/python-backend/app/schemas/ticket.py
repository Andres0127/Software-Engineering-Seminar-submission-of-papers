from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class TicketTypeBase(BaseModel):
    name: str
    price: Decimal
    quantity: int
    description: Optional[str] = None
    benefits: Optional[str] = None


class TicketTypeCreate(TicketTypeBase):
    event_id: int


class TicketTypeResponse(TicketTypeBase):
    id: int
    event_id: int

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    id: int
    ticket_type_id: int
    qr_code: str
    seat_number: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


