from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..schemas.event import EventCreate, EventResponse
from ..models.event import Event
from datetime import datetime

router = APIRouter(prefix="/api/events", tags=["events"])

@router.post("/", response_model=EventResponse)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    try:
        db_event = Event(
            name=event.name,
            date=event.date,
            category=event.category,
            capacity=event.capacity,
            event_status="draft",
            age_restriction=event.age_restriction,
            max_tickets_per_purchase=event.max_tickets_per_purchase,
            media=event.media,
            organizer_id=1,
            location_id=event.location_id
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Transformar el evento al formato esperado por el frontend
    from datetime import timedelta
    
    transformed_event = EventResponse(
        # Campos mapeados para el frontend
        id=event.id,
        title=event.name,
        description=f"Evento de {event.category}" if event.category else "Evento especial",
        startDate=event.date,
        endDate=event.date + timedelta(hours=2) if event.date else None,
        maxAttendees=event.capacity or 100,
        ticketPrice=50000.0,
        status=event.event_status.upper() if event.event_status else "PUBLISHED",
        categoryId=1,
        locationId=event.location_id or 1,
        organizerId=event.organizer_id or 1,
        
        # Campos originales
        name=event.name,
        date=event.date,
        category=event.category,
        capacity=event.capacity,
        event_status=event.event_status,
        age_restriction=event.age_restriction,
        max_tickets_per_purchase=event.max_tickets_per_purchase,
        media=event.media,
        organizer_id=event.organizer_id,
        location_id=event.location_id,
        created_at=getattr(event, 'created_at', None)
    )
    
    return transformed_event

@router.get("/", response_model=List[EventResponse])
async def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    
    # Transformar cada evento al formato esperado por el frontend
    transformed_events = []
    for event in events:
        from datetime import timedelta
        
        transformed_event = EventResponse(
            # Campos mapeados para el frontend
            id=event.id,
            title=event.name,  # name -> title
            description=f"Evento de {event.category}" if event.category else "Evento especial",
            startDate=event.date,  # date -> startDate
            endDate=event.date + timedelta(hours=2) if event.date else None,  # +2 horas
            maxAttendees=event.capacity or 100,  # capacity -> maxAttendees
            ticketPrice=50000.0,  # precio por defecto
            status=event.event_status.upper() if event.event_status else "PUBLISHED",
            categoryId=1,  # por defecto
            locationId=event.location_id or 1,
            organizerId=event.organizer_id or 1,
            
            # Campos originales (para compatibilidad)
            name=event.name,
            date=event.date,
            category=event.category,
            capacity=event.capacity,
            event_status=event.event_status,
            age_restriction=event.age_restriction,
            max_tickets_per_purchase=event.max_tickets_per_purchase,
            media=event.media,
            organizer_id=event.organizer_id,
            location_id=event.location_id,
            created_at=getattr(event, 'created_at', None)
        )
        transformed_events.append(transformed_event)
    
    return transformed_events

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: int, event: EventCreate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for key, value in event.dict().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
