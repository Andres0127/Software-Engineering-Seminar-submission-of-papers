from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, conint


class OrderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    event_id: int = Field(..., alias="eventId")
    ticket_type_id: int = Field(..., alias="ticketTypeId")
    quantity: conint(gt=0) = Field(..., alias="quantity")
    buyer_info: dict | None = Field(None, alias="buyerInfo")


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    order_number: str
    purchase_date: datetime
    status: str
    total_amount: Decimal
    buyer_id: int
    event_id: int | None = Field(None, alias="eventId")
    ticket_type_id: int | None = Field(None, alias="ticketTypeId")
    quantity: int | None = Field(None, alias="quantity")


