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

class EventResponse(BaseModel):
    # Campos adaptados para el frontend React
    id: int
    title: str  # mapeado desde 'name'
    description: Optional[str] = "Descripción del evento"  # campo faltante
    startDate: datetime  # mapeado desde 'date'  
    endDate: Optional[datetime] = None  # calculado desde startDate + 2 horas
    maxAttendees: int  # mapeado desde 'capacity'
    ticketPrice: float = 50000.0  # precio por defecto (faltante en modelo)
    status: str  # mapeado desde 'event_status'
    categoryId: Optional[int] = 1  # por defecto
    locationId: Optional[int] = None  # mapeado desde 'location_id'
    organizerId: int  # mapeado desde 'organizer_id'
    
    # Campos originales del backend (opcionales)
    name: Optional[str] = None
    date: Optional[datetime] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    event_status: Optional[str] = None
    age_restriction: Optional[str] = None
    max_tickets_per_purchase: Optional[int] = None
    media: Optional[str] = None
    organizer_id: Optional[int] = None
    location_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
