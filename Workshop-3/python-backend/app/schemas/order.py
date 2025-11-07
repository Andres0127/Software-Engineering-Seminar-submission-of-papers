from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class OrderCreate(BaseModel):
    ticket_type_id: int
    quantity: int


class OrderResponse(BaseModel):
    id: int
    order_number: str
    purchase_date: datetime
    status: str
    total_amount: Decimal
    buyer_id: int

    class Config:
        from_attributes = True


