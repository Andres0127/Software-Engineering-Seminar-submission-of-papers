from sqlalchemy import Column, String, Integer
from .base import BaseModel

class Location(BaseModel):
    __tablename__ = "locations"
    
    name = Column(String(100), nullable=False)
    address = Column(String(200), nullable=False)
    capacity = Column(Integer, nullable=False)
