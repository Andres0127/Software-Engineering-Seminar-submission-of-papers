from sqlalchemy import Column, String, Integer, DateTime
from .base import BaseModel

class Event(BaseModel):
    __tablename__ = "events"

    name = Column(String(100), nullable=False)
    date = Column(DateTime, nullable=False)
    category = Column(String(50))
    capacity = Column(Integer)
    event_status = Column(String(20), default="draft")
    age_restriction = Column(String(20))
    max_tickets_per_purchase = Column(Integer, default=10)
    media = Column(String(500))
    organizer_id = Column(Integer)
    location_id = Column(Integer)
