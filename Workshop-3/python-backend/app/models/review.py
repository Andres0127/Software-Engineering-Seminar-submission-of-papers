from sqlalchemy import Column, String, Integer, ForeignKey, Text
from .base import BaseModel

class Review(BaseModel):
    __tablename__ = "reviews"
    
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
