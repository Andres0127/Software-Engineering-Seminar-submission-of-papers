import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from decimal import Decimal

from main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.ticket import TicketType
from app.models.event import Event
from app.models.location import Location
from datetime import datetime, timedelta

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_location(db_session):
    """Create a sample location for testing"""
    location = Location(
        name="Test Venue",
        address="123 Test Street",
        capacity=1000
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location


@pytest.fixture
def sample_event(db_session, sample_location):
    """Create a sample event for testing"""
    event = Event(
        name="Test Event",
        date=datetime.now() + timedelta(days=30),
        category="Music",
        capacity=500,
        event_status="published",
        organizer_id=1,
        location_id=sample_location.id
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event


@pytest.fixture
def sample_ticket_type(db_session, sample_event):
    """Create a sample ticket type for testing"""
    ticket_type = TicketType(
        name="VIP Ticket",
        price=Decimal("99.99"),
        quantity=100,
        description="VIP access with premium benefits",
        benefits="Free parking, front row seats",
        event_id=sample_event.id
    )
    db_session.add(ticket_type)
    db_session.commit()
    db_session.refresh(ticket_type)
    return ticket_type


def test_create_ticket_type_success(client, sample_event):
    """Test creating a new ticket type"""
    ticket_data = {
        "name": "General Admission",
        "price": "49.99",
        "quantity": 200,
        "description": "General admission ticket",
        "benefits": "Access to event",
        "event_id": sample_event.id
    }
    
    response = client.post("/api/tickets/types", json=ticket_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "General Admission"
    assert float(data["price"]) == 49.99
    assert data["quantity"] == 200
    assert data["event_id"] == sample_event.id


def test_create_ticket_type_missing_fields(client, sample_event):
    """Test creating ticket type with missing required fields"""
    ticket_data = {
        "name": "Incomplete Ticket"
    }
    
    response = client.post("/api/tickets/types", json=ticket_data)
    assert response.status_code == 422  # Validation error


def test_get_ticket_type_success(client, sample_ticket_type):
    """Test retrieving a ticket type by ID"""
    response = client.get(f"/api/tickets/types/{sample_ticket_type.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_ticket_type.id
    assert data["name"] == "VIP Ticket"
    assert float(data["price"]) == 99.99


def test_get_ticket_type_not_found(client):
    """Test retrieving a non-existent ticket type"""
    response = client.get("/api/tickets/types/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_event_ticket_types_success(client, sample_event, sample_ticket_type):
    """Test retrieving all ticket types for an event"""
    response = client.get(f"/api/tickets/event/{sample_event.id}/types")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(ticket["id"] == sample_ticket_type.id for ticket in data)


def test_get_event_ticket_types_empty(client, db_session, sample_location):
    """Test retrieving ticket types for event with no tickets"""
    # Create a new event without tickets
    new_event = Event(
        name="Empty Event",
        date=datetime.now() + timedelta(days=30),
        category="Sports",
        capacity=100,
        event_status="published",
        organizer_id=1,
        location_id=sample_location.id
    )
    db_session.add(new_event)
    db_session.commit()
    db_session.refresh(new_event)
    
    response = client.get(f"/api/tickets/event/{new_event.id}/types")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

