from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict

from .utils import to_camel


class TicketTypeBase(BaseModel):
    name: str
    price: Decimal
    quantity: int
    description: Optional[str] = None
    benefits: Optional[str] = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TicketTypeCreate(TicketTypeBase):
    event_id: int

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TicketTypeResponse(TicketTypeBase):
    id: int
    event_id: int

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


class TicketResponse(BaseModel):
    id: int
    ticket_type_id: int
    qr_code: str
    seat_number: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


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

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

