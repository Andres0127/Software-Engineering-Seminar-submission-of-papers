from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, conint

from .category import CategoryResponse
from .location import LocationResponse
from .ticket import TicketTypeResponse


class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"


class TicketZonePayload(BaseModel):
    name: str
    price: Decimal
    quantity: conint(gt=0)
    description: Optional[str] = None
    benefits: Optional[str] = None


class EventCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = Field(None, max_length=1200)
    startDate: datetime
    endDate: Optional[datetime] = None
    maxAttendees: conint(gt=0)
    categoryId: Optional[int] = None
    locationId: int
    status: EventStatus = EventStatus.DRAFT
    ticketPrice: Optional[Decimal] = None
    maxTicketsPerPurchase: Optional[conint(gt=0)] = 10
    ageRestriction: Optional[str] = None
    zones: Optional[List[TicketZonePayload]] = Field(None)

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "title": "Innovation Summit",
                "description": "A full-day program with talks and workshops.",
                "startDate": "2025-12-15T09:00:00Z",
                "endDate": "2025-12-15T17:00:00Z",
                "maxAttendees": 250,
                "categoryId": 1,
                "locationId": 1,
                "status": "DRAFT",
                "ticketPrice": 120000,
                "maxTicketsPerPurchase": 6,
            }
        }


class EventResponse(BaseModel):
    id: int
    name: str
    title: str
    description: Optional[str] = None
    startDate: datetime
    endDate: Optional[datetime] = None
    maxAttendees: int
    ticketPrice: float = 0.0
    status: str
    categoryId: Optional[int] = None
    locationId: Optional[int] = None
    organizerId: int
    category: Optional[CategoryResponse] = None
    location: Optional[LocationResponse] = None
    ageRestriction: Optional[str] = None
    maxTicketsPerPurchase: Optional[int] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    ticketTypes: List['TicketTypeResponse'] = Field(default_factory=list, alias='ticketTypes')

    class Config:
        from_attributes = True


class TicketTypeStatistics(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    ticket_type_id: int = Field(alias="ticketTypeId")
    name: str
    price: float
    quantity: int
    sold: int
    remaining: int
    revenue: float


class EventStatistics(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    event_id: int = Field(alias="eventId")
    tickets_sold: int = Field(alias="ticketsSold")
    total_revenue: float = Field(alias="totalRevenue")
    remaining_capacity: int = Field(alias="remainingCapacity")
    ticket_types: List[TicketTypeStatistics] = Field(alias="ticketTypes")
