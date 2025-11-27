from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.category import Category
from ..models.event import Event
from ..models.location import Location
from ..models.order import Order
from ..models.ticket import TicketType
from ..schemas.category import CategoryResponse
from ..schemas.event import EventCreate, EventResponse, EventStatistics, EventStatus, TicketTypeStatistics
from ..schemas.location import LocationResponse
from ..schemas.ticket import TicketTypeResponse
from ..utils.auth import (
    get_current_user_id,
    get_current_user_role,
    require_auth,
    require_organizer_or_admin,
)

router = APIRouter(prefix="/api/events", tags=["events"])


def _normalize_status(value: Optional[str]) -> str:
    if not value:
        return EventStatus.PUBLISHED.value.lower()
    normalized = value.strip().upper()
    if normalized not in EventStatus.__members__:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Allowed values are DRAFT, PUBLISHED, or CANCELLED.",
        )
    return normalized.lower()


def _normalize_to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if not dt:
        return None
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def _validate_event_dates(start_date: datetime, end_date: Optional[datetime]) -> datetime:
    start_date = _normalize_to_utc(start_date)
    end_date = _normalize_to_utc(end_date)

    now = datetime.utcnow()
    if start_date < now:
        raise HTTPException(status_code=400, detail="startDate must be a future datetime.")

    if end_date and end_date <= start_date:
        raise HTTPException(status_code=400, detail="endDate must be after startDate.")

    return end_date or (start_date + timedelta(hours=2))


def _build_event_response(event: Event, db: Session) -> EventResponse:
    category = None
    location = None

    category_id = getattr(event, "category_id", None)
    if category_id:
        category = db.query(Category).filter(Category.id == category_id).first()

    if event.location_id:
        location = db.query(Location).filter(Location.id == event.location_id).first()

    ticket_price = 0.0
    ticket_type = (
        db.query(TicketType)
        .filter(TicketType.event_id == event.id)
        .order_by(TicketType.price.asc())
        .first()
    )
    if ticket_type and ticket_type.price is not None:
        ticket_price = float(ticket_type.price)

    location_capacity = location.capacity if location and location.capacity is not None else 0
    max_attendees = event.capacity or location_capacity or 0
    end_date = getattr(event, "end_date", None) or (event.date + timedelta(hours=2) if event.date else None)

    return EventResponse(
        id=event.id,
        name=event.name,
        title=event.name,
        description=getattr(event, "description", None),
        startDate=event.date,
        endDate=end_date,
        maxAttendees=max_attendees,
        ticketPrice=ticket_price,
        status=event.event_status.upper() if event.event_status else EventStatus.DRAFT.value,
        categoryId=category.id if category else category_id,
        locationId=location.id if location else event.location_id,
        organizerId=event.organizer_id,
        category=CategoryResponse.model_validate(category) if category else None,
        location=LocationResponse.model_validate(location) if location else None,
        ageRestriction=event.age_restriction,
        maxTicketsPerPurchase=getattr(event, "max_tickets_per_purchase", None),
        createdAt=event.created_at,
        updatedAt=event.updated_at,
    )


@router.post(
    "/",
    response_model=EventResponse,
    dependencies=[Depends(require_organizer_or_admin)],
)
async def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    if not payload.categoryId:
        raise HTTPException(status_code=400, detail="categoryId is required.")

    category = db.query(Category).filter(Category.id == payload.categoryId).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    location = db.query(Location).filter(Location.id == payload.locationId).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    end_date = _validate_event_dates(payload.startDate, payload.endDate)

    if payload.maxTicketsPerPurchase and payload.maxTicketsPerPurchase > payload.maxAttendees:
        raise HTTPException(
            status_code=400,
            detail="maxTicketsPerPurchase cannot exceed the event capacity.",
        )

    if payload.ticketPrice is not None and payload.ticketPrice < 0:
        raise HTTPException(status_code=400, detail="Ticket price must be positive.")

    db_event = Event(
        name=payload.title.strip(),
        description=payload.description,
        date=payload.startDate,
        end_date=end_date,
        category=category.name,
        category_id=category.id,
        capacity=payload.maxAttendees,
        event_status=_normalize_status(payload.status.value),
        age_restriction=payload.ageRestriction,
        max_tickets_per_purchase=payload.maxTicketsPerPurchase or 10,
        organizer_id=current_user_id,
        location_id=location.id,
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    if payload.ticketPrice is not None:
        ticket_quantity = payload.maxAttendees or (location.capacity if location else 0) or 1
        ticket_type = TicketType(
            name="General Admission",
            price=payload.ticketPrice,
            quantity=ticket_quantity,
            description=payload.description or "General admission ticket",
            benefits="",
            event_id=db_event.id,
        )
        db.add(ticket_type)
        db.commit()
        db.refresh(ticket_type)

    return _build_event_response(db_event, db)


@router.get("/", response_model=List[EventResponse])
async def list_events(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None, alias="categoryId"),
    location_id: Optional[int] = Query(None, alias="locationId"),
    start_date: Optional[datetime] = Query(None, alias="startDate"),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
):
    query = db.query(Event)
    query = query.filter(Event.event_status == _normalize_status(status))

    if category_id:
        query = query.filter(Event.category_id == category_id)

    if location_id:
        query = query.filter(Event.location_id == location_id)

    if start_date:
        query = query.filter(Event.date >= start_date)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(Event.name.ilike(search_term), Event.description.ilike(search_term))
        )

    events = (
        query.order_by(Event.date.asc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return [_build_event_response(event, db) for event in events]


    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user_role != "ROLE_ADMIN" and event.organizer_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only edit your own events.",
        )

    if not payload.categoryId:
        raise HTTPException(status_code=400, detail="categoryId is required.")

    category = db.query(Category).filter(Category.id == payload.categoryId).first()
    location = db.query(Location).filter(Location.id == payload.locationId).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    end_date = _validate_event_dates(payload.startDate, payload.endDate)

    if payload.maxTicketsPerPurchase and payload.maxTicketsPerPurchase > payload.maxAttendees:
        raise HTTPException(
            status_code=400,
            detail="maxTicketsPerPurchase cannot exceed the event capacity.",
        )

    if payload.ticketPrice is not None and payload.ticketPrice < 0:
        raise HTTPException(status_code=400, detail="Ticket price must be positive.")

    event.name = payload.title.strip()
    event.description = payload.description
    event.date = payload.startDate
    event.end_date = end_date
    event.category = category.name
    event.category_id = category.id
    event.capacity = payload.maxAttendees
    event.location_id = location.id
    event.event_status = _normalize_status(payload.status.value)
    event.age_restriction = payload.ageRestriction
    event.max_tickets_per_purchase = payload.maxTicketsPerPurchase or 10

    ticket_type = (
        db.query(TicketType)
        .filter(TicketType.event_id == event.id)
        .order_by(TicketType.id.asc())
        .first()
    )
    if ticket_type and payload.ticketPrice is not None:
        ticket_type.price = payload.ticketPrice
        ticket_type.quantity = payload.maxAttendees or ticket_type.quantity
        ticket_type.description = payload.description or ticket_type.description

    db.commit()
    db.refresh(event)

    return _build_event_response(event, db)


@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user_role != "ROLE_ADMIN" and event.organizer_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only delete your own events.",
        )

    db.delete(event)
    db.commit()

    return {"message": "Event deleted successfully"}


@router.get(
    "/my-events",
    response_model=List[EventResponse],
    dependencies=[Depends(require_organizer_or_admin)],
)
async def get_my_events(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    events = (
        db.query(Event)
        .filter(Event.organizer_id == current_user_id)
        .order_by(Event.date.asc())
        .all()
    )

    return [_build_event_response(event, db) for event in events]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return _build_event_response(event, db)


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user_role != "ROLE_ADMIN" and event.organizer_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only view statistics for your own events.",
        )

    statuses = ["pending", "confirmed"]
    sold_event = (
        db.query(func.coalesce(func.sum(Order.quantity), 0))
        .filter(Order.event_id == event.id, Order.status.in_(statuses))
        .scalar()
        or 0
    )

    location = None
    if event.location_id:
        location = db.query(Location).filter(Location.id == event.location_id).first()

    capacity = event.capacity or (location.capacity if location else 0) or 0
    remaining_capacity = max(0, int(capacity) - int(sold_event)) if capacity else 0

    ticket_types = db.query(TicketType).filter(TicketType.event_id == event.id).all()
    ticket_stats = []
    total_revenue = Decimal("0")

    for ticket_type in ticket_types:
        sold_tickets = (
            db.query(func.coalesce(func.sum(Order.quantity), 0))
            .filter(
                Order.ticket_type_id == ticket_type.id,
                Order.status.in_(statuses),
            )
            .scalar()
            or 0
        )
        remaining = max(0, ticket_type.quantity - int(sold_tickets))
        revenue = Decimal(str(ticket_type.price)) * Decimal(int(sold_tickets))
        total_revenue += revenue

        ticket_stats.append(
            TicketTypeStatistics(
                ticket_type_id=ticket_type.id,
                name=ticket_type.name,
                price=float(ticket_type.price or 0),
                quantity=ticket_type.quantity,
                sold=int(sold_tickets),
                remaining=remaining,
                revenue=float(revenue),
            )
        )

    return EventStatistics(
        event_id=event.id,
        tickets_sold=int(sold_event),
        total_revenue=float(total_revenue),
        remaining_capacity=int(remaining_capacity),
        ticket_types=ticket_stats,
    )


@router.get("/{event_id}/tickets", response_model=List[TicketTypeResponse])
async def get_event_ticket_types(event_id: int, db: Session = Depends(get_db)):
    tickets = (
        db.query(TicketType)
        .filter(TicketType.event_id == event_id)
        .all()
    )
    return tickets


@router.get("/{event_id}/tickets/{ticket_type_id}/availability")
async def check_event_ticket_availability(
    event_id: int,
    ticket_type_id: int,
    quantity: int = Query(..., gt=0),
    db: Session = Depends(get_db),
):
    ticket_type = (
        db.query(TicketType)
        .filter(
            TicketType.id == ticket_type_id,
            TicketType.event_id == event_id,
        )
        .first()
    )

    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")

    sold_quantity = db.query(func.coalesce(func.sum(Order.quantity), 0)).filter(
        Order.ticket_type_id == ticket_type_id,
        Order.status.in_(["pending", "confirmed"]),
    ).scalar() or 0

    remaining = max(0, ticket_type.quantity - int(sold_quantity))
    is_available = remaining >= quantity

    return {
        "available": is_available,
        "remainingTickets": remaining,
        "requestedQuantity": quantity,
        "totalQuantity": ticket_type.quantity,
    }
