from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


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


class BuyerTicketResponse(BaseModel):
    id: int
    qr_code: str
    status: str
    ticket_type_id: int
    ticket_type_name: str
    ticket_price: float
    event_id: int
    event_title: str
    event_start: Optional[datetime] = None
    location_name: Optional[str] = None
    order_id: int
    order_number: str

    class Config:
        from_attributes = True

