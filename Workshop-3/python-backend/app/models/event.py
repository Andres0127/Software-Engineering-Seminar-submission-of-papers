from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from .base import BaseModel


class Event(BaseModel):
    __tablename__ = "events"

    name = Column(String(100), nullable=False)
    date = Column(DateTime, nullable=False)
    description = Column(Text)
    end_date = Column(DateTime)
    category = Column(String(50))
    category_id = Column(Integer, ForeignKey("categories.id"))
    capacity = Column(Integer)
    event_status = Column(String(20), default="draft")
    age_restriction = Column(String(20))
    max_tickets_per_purchase = Column(Integer, default=10)
    media = Column(String(500))
    organizer_id = Column(Integer)
    location_id = Column(Integer)
