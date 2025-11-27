from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

from .base import BaseModel


class Location(BaseModel):
    __tablename__ = "locations"

    name = Column(String(100), nullable=False)
    address = Column(String(200), nullable=False)
    capacity = Column(Integer, nullable=False)
    zones = relationship("LocationZone", back_populates="location")
