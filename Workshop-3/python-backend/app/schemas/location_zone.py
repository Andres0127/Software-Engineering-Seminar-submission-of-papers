from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class LocationZoneResponse(BaseModel):
    id: int
    location_id: int = Field(alias="locationId")
    name: str
    price: Decimal
    quantity: int
    description: Optional[str] = None
    benefits: Optional[str] = None

    class Config:
        from_attributes = True

