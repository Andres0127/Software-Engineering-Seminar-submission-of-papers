from datetime import datetime
from decimal import Decimal

from typing import Literal

from .utils import to_camel

from pydantic import BaseModel, ConfigDict, Field, conint


class OrderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    event_id: int = Field(..., alias="eventId")
    ticket_type_id: int = Field(..., alias="ticketTypeId")
    quantity: conint(gt=0) = Field(..., alias="quantity")
    buyer_info: dict | None = Field(None, alias="buyerInfo")


class OrderResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )

    id: int
    order_number: str
    purchase_date: datetime
    status: str
    total_amount: Decimal
    buyer_id: int
    event_id: int | None = Field(None, alias="eventId")
    ticket_type_id: int | None = Field(None, alias="ticketTypeId")
    quantity: int | None = Field(None, alias="quantity")
    refund_reason: str | None = Field(None, alias="refundReason")


class OrderPayment(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    payment_method: Literal['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'CASH'] = Field(
        ..., alias='paymentMethod'
    )
    transaction_id: str | None = Field(None, alias='transactionId')
    payment_details: dict | None = Field(None, alias='paymentDetails')


class OrderRefundRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    reason: str = Field(..., alias="reason")

