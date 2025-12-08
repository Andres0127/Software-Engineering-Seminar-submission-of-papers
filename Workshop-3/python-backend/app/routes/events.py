import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, desc
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from ..core.database import get_db
from ..models.category import Category
from ..models.event import Event
from ..models.location import Location
from ..models.order import Order
from ..models.ticket import Ticket, TicketType
from ..models.user import User
from ..schemas.category import CategoryResponse
from ..schemas.event import (
    EventCreate,
    EventResponse,
    EventStatistics,
    EventStatus,
    TicketTypeStatistics,
    TicketZonePayload,
)
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


def _get_ticket_types_for_event(db: Session, event_id: int) -> List[TicketTypeResponse]:
    ticket_types = (
        db.query(TicketType)
        .filter(TicketType.event_id == event_id)
        .order_by(TicketType.price.asc())
        .all()
    )
    return [TicketTypeResponse.model_validate(ticket) for ticket in ticket_types]


def _has_event_orders(db: Session, event_id: int) -> bool:
    """Check if event has confirmed orders (case-insensitive)"""
    # Only block updates if there are confirmed orders
    # Allow updates if orders are pending, cancelled, or refunded
    count = (
        db.query(func.count(Order.id))
        .filter(
            Order.event_id == event_id,
            func.lower(Order.status).in_(['confirmed', 'paid', 'completed'])
        )
        .scalar()
    )
    logger.info(f"Event {event_id} has {count} confirmed orders")
    return bool(count)


def _sync_ticket_types(
    db: Session, event: Event, zones: List[TicketZonePayload]
) -> None:
    db.query(TicketType).filter(TicketType.event_id == event.id).delete(
        synchronize_session=False
    )
    for zone in zones:
        ticket_type = TicketType(
            name=zone.name.strip() or "General Admission",
            price=zone.price,
            quantity=zone.quantity,
            description=zone.description,
            benefits=zone.benefits,
            event_id=event.id,
        )
        db.add(ticket_type)
    db.flush()


def _build_event_response(event: Event, db: Session) -> EventResponse:
    category = None
    location = None
    organizer = None

    category_id = getattr(event, "category_id", None)
    if category_id:
        category = db.query(Category).filter(Category.id == category_id).first()

    if event.location_id:
        location = db.query(Location).filter(Location.id == event.location_id).first()

    # Get organizer information
    organizer_name = None
    if event.organizer_id:
        organizer = db.query(User).filter(User.id == event.organizer_id).first()
        if organizer:
            organizer_name = organizer.name
            logger.info(f"Found organizer: {organizer_name} (ID: {event.organizer_id})")
        else:
            logger.warning(f"Organizer with ID {event.organizer_id} not found in Python database")
            # Try to get from Java backend if available
            # For now, we'll leave it as None and handle in frontend

    ticket_price = 0.0
    ticket_types = _get_ticket_types_for_event(db, event.id)
    if ticket_types:
        ticket_price = min((tt.price for tt in ticket_types if tt.price is not None), default=0.0)

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
        organizerName=organizer_name,
        category=CategoryResponse.model_validate(category) if category else None,
        location=LocationResponse.model_validate(location) if location else None,
        ageRestriction=event.age_restriction,
        maxTicketsPerPurchase=getattr(event, "max_tickets_per_purchase", None),
        createdAt=event.created_at,
        updatedAt=event.updated_at,
        ticketTypes=ticket_types,
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

    # Validate event capacity against location capacity
    location_capacity = location.capacity if location and location.capacity else 0
    if location_capacity > 0 and payload.maxAttendees > location_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Event capacity ({payload.maxAttendees}) exceeds location capacity ({location_capacity}). Please adjust the event capacity or select a different location."
        )

    if payload.maxTicketsPerPurchase and payload.maxTicketsPerPurchase > payload.maxAttendees:
        raise HTTPException(
            status_code=400,
            detail="maxTicketsPerPurchase cannot exceed the event capacity.",
        )

    if payload.ticketPrice is not None and payload.ticketPrice < 0:
        raise HTTPException(status_code=400, detail="Ticket price must be positive.")

    # Normalize status to lowercase for consistency
    normalized_status = _normalize_status(payload.status.value)
    logger.info(f"Creating event with status: {normalized_status} (from {payload.status.value})")
    
    db_event = Event(
        name=payload.title.strip(),
        description=payload.description,
        date=payload.startDate,
        end_date=end_date,
        category=category.name,
        category_id=category.id,
        capacity=payload.maxAttendees,
        event_status=normalized_status,
        age_restriction=payload.ageRestriction,
        max_tickets_per_purchase=payload.maxTicketsPerPurchase or 10,
        organizer_id=current_user_id,
        location_id=location.id,
    )

    db.add(db_event)
    db.flush()
    # Ensure created_at is set if it wasn't set automatically
    if db_event.created_at is None:
        db_event.created_at = datetime.utcnow()
        db.flush()
    logger.info(f"Event created with ID: {db_event.id}, status: {db_event.event_status}, created_at: {db_event.created_at}")

    zones = payload.zones or []
    
    # Validate zones capacity against location and event capacity
    if zones:
        total_zones_capacity = sum(zone.quantity for zone in zones)
        location_capacity = location.capacity if location and location.capacity else 0
        event_capacity = payload.maxAttendees
        
        # Check against location capacity
        if total_zones_capacity > location_capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Total zones capacity ({total_zones_capacity}) exceeds location capacity ({location_capacity}). Please adjust the zones quantities."
            )
        
        # Check against event capacity
        if total_zones_capacity > event_capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Total zones capacity ({total_zones_capacity}) exceeds event capacity ({event_capacity}). Please adjust the zones quantities."
            )
    
    if not zones and payload.ticketPrice is not None:
        location_capacity = location.capacity if location and location.capacity else 0
        event_capacity = payload.maxAttendees
        
        # Use the minimum of location capacity and event capacity
        ticket_quantity = min(
            payload.maxAttendees,
            location_capacity if location_capacity > 0 else payload.maxAttendees
        ) or 1
        
        zones = [
            TicketZonePayload(
                name="General Admission",
                price=payload.ticketPrice,
                quantity=ticket_quantity,
                description=payload.description or "General admission ticket",
                benefits="",
            )
        ]
        
        # Validate the auto-created zone
        if ticket_quantity > location_capacity and location_capacity > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Event capacity ({ticket_quantity}) exceeds location capacity ({location_capacity}). Please adjust the event capacity or select a different location."
            )

    if zones:
        _sync_ticket_types(db, db_event, zones)

    db.commit()
    db.refresh(db_event)

    return _build_event_response(db_event, db)


@router.get("/", response_model=List[EventResponse])
async def list_events(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None, alias="categoryId"),
    location_id: Optional[int] = Query(None, alias="locationId"),
    start_date: Optional[datetime] = Query(None, alias="startDate"),
    end_date: Optional[datetime] = Query(None, alias="endDate"),
    max_price: Decimal | None = Query(None, alias="maxPrice"),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
):
    query = db.query(Event)
    # Use case-insensitive comparison for status
    normalized_status = _normalize_status(status)
    logger.info(f"Listing events with status filter: '{normalized_status}' (from query param: {status})")
    query = query.filter(func.lower(Event.event_status) == normalized_status)
    
    # Log total count before pagination
    total_count = query.count()
    logger.info(f"Total events found with status '{normalized_status}': {total_count}")

    if category_id:
        query = query.filter(Event.category_id == category_id)

    if location_id:
        query = query.filter(Event.location_id == location_id)

    if start_date:
        query = query.filter(Event.date >= start_date)

    if end_date:
        query = query.filter(Event.date <= end_date)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(Event.name.ilike(search_term), Event.description.ilike(search_term))
        )

    if max_price is not None:
        subquery = (
            db.query(TicketType.event_id)
            .filter(TicketType.price <= max_price)
            .distinct()
            .subquery()
        )
        query = query.filter(Event.id.in_(subquery))

    # Order by creation date descending (newest first) so newly created events appear first
    # If created_at is None, fall back to ordering by date ascending
    events = (
        query.order_by(desc(Event.created_at).nullslast(), Event.date.asc())
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

    # Validate event capacity against location capacity
    location_capacity = location.capacity if location and location.capacity else 0
    if location_capacity > 0 and payload.maxAttendees > location_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Event capacity ({payload.maxAttendees}) exceeds location capacity ({location_capacity}). Please adjust the event capacity or select a different location."
        )

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

    if payload.zones:
        # Calculate total confirmed orders quantity
        confirmed_orders_quantity = (
            db.query(func.coalesce(func.sum(Order.quantity), 0))
            .filter(
                Order.event_id == event.id,
                func.lower(Order.status).in_(['confirmed', 'paid', 'completed'])
            )
            .scalar()
        ) or 0
        
        # Validate zones capacity against location and event capacity
        total_zones_capacity = sum(zone.quantity for zone in payload.zones)
        location_capacity = location.capacity if location and location.capacity else 0
        event_capacity = payload.maxAttendees
        
        logger.info(f"Validating zones: total={total_zones_capacity}, location_capacity={location_capacity}, event_capacity={event_capacity}, confirmed_orders={confirmed_orders_quantity}")
        
        # Check if new capacity is less than confirmed orders
        if total_zones_capacity < confirmed_orders_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reduce zones capacity to {total_zones_capacity}. There are {confirmed_orders_quantity} confirmed orders. The total zones capacity must be at least {confirmed_orders_quantity}."
            )
        
        # Check against location capacity
        if location_capacity > 0 and total_zones_capacity > location_capacity:
            error_msg = f"Total zones capacity ({total_zones_capacity}) exceeds location capacity ({location_capacity}). Please adjust the zones quantities."
            logger.warning(f"Validation failed: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=error_msg
            )
        
        # Check against event capacity
        if total_zones_capacity > event_capacity:
            error_msg = f"Total zones capacity ({total_zones_capacity}) exceeds event capacity ({event_capacity}). Please adjust the zones quantities."
            logger.warning(f"Validation failed: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=error_msg
            )
        
        _sync_ticket_types(db, event, payload.zones)

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


@router.get(
    "/{event_id}/statistics",
    response_model=EventStatistics,
    dependencies=[Depends(require_organizer_or_admin)],
)
async def get_event_statistics(
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
                ticketTypeId=ticket_type.id,
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

    event.name = payload.title.strip()
    event.description = payload.description
    event.date = payload.startDate
    event.end_date = payload.endDate
    event.capacity = payload.maxAttendees
    event.location_id = payload.locationId
    event.event_status = _normalize_status(payload.status.value)
    event.age_restriction = payload.ageRestriction
    event.max_tickets_per_purchase = payload.maxTicketsPerPurchase or 10

    if payload.zones:
        if _has_event_orders(db, event.id):
            raise HTTPException(
                status_code=400,
                detail="Cannot update ticket zones after sales have started.",
            )
        _sync_ticket_types(db, event, payload.zones)

    db.commit()
    db.refresh(event)

    return _build_event_response(event, db)


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
