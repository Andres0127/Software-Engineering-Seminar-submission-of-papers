from pydantic import BaseModel, conint
from datetime import datetime
from typing import Optional

class EventBase(BaseModel):
    name: str
    date: datetime
    category: str
    capacity: conint(gt=0)
    age_restriction: Optional[str] = None
    max_tickets_per_purchase: conint(gt=0) = 10
    media: Optional[str] = None

class EventCreate(EventBase):
    location_id: int

class EventResponse(EventBase):
    id: int
    event_status: str
    organizer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
