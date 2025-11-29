from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class LocationZone(BaseModel):
    __tablename__ = "location_zones"

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    quantity = Column(Integer, nullable=False, default=0)
    description = Column(String(400))
    benefits = Column(String(400))

    location = relationship("Location", back_populates="zones")




