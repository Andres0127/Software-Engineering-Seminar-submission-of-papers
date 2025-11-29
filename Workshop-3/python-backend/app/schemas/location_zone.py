from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class LocationZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    location_id: int = Field(alias="locationId")
    name: str
    price: Decimal
    quantity: int
    description: Optional[str] = None
    benefits: Optional[str] = None




