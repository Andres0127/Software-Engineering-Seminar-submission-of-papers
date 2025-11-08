import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta

from main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.event import Event
from app.models.location import Location

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
        age_restriction="18+",
        max_tickets_per_purchase=5,
        media="https://example.com/image.jpg",
        organizer_id=1,
        location_id=sample_location.id
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event


def test_create_event_success(client, sample_location):
    """Test creating a new event"""
    event_data = {
        "name": "New Concert",
        "date": (datetime.now() + timedelta(days=30)).isoformat(),
        "category": "Music",
        "capacity": 1000,
        "age_restriction": "18+",
        "max_tickets_per_purchase": 5,
        "media": "https://example.com/image.jpg",
        "location_id": sample_location.id
    }
    
    response = client.post("/api/events/", json=event_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Concert"
    assert data["category"] == "Music"
    assert data["capacity"] == 1000
    assert data["event_status"] == "draft"
    # Note: location_id is not in EventResponse schema, only in the model


def test_create_event_missing_fields(client):
    """Test creating event with missing required fields"""
    event_data = {
        "name": "Incomplete Event"
    }
    
    response = client.post("/api/events/", json=event_data)
    assert response.status_code == 422  # Validation error


def test_get_event_success(client, sample_event):
    """Test retrieving an event by ID"""
    response = client.get(f"/api/events/{sample_event.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_event.id
    assert data["name"] == "Test Event"
    assert data["category"] == "Music"


def test_get_event_not_found(client):
    """Test retrieving a non-existent event"""
    response = client.get("/api/events/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_events_success(client, sample_event):
    """Test listing all events"""
    response = client.get("/api/events/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(event["id"] == sample_event.id for event in data)


def test_update_event_success(client, sample_event, sample_location):
    """Test updating an event"""
    update_data = {
        "name": "Updated Event Name",
        "date": (datetime.now() + timedelta(days=60)).isoformat(),
        "category": "Sports",
        "capacity": 2000,
        "age_restriction": "21+",
        "max_tickets_per_purchase": 10,
        "media": "https://example.com/new-image.jpg",
        "location_id": sample_location.id
    }
    
    response = client.put(f"/api/events/{sample_event.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Event Name"
    assert data["category"] == "Sports"
    assert data["capacity"] == 2000


def test_update_event_not_found(client, sample_location):
    """Test updating a non-existent event"""
    update_data = {
        "name": "Non-existent Event",
        "date": datetime.now().isoformat(),
        "category": "Music",
        "capacity": 100,
        "location_id": sample_location.id
    }
    
    response = client.put("/api/events/999", json=update_data)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_event_success(client, sample_event):
    """Test deleting an event"""
    response = client.delete(f"/api/events/{sample_event.id}")
    
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"].lower()
    
    # Verify event is deleted
    get_response = client.get(f"/api/events/{sample_event.id}")
    assert get_response.status_code == 404


def test_delete_event_not_found(client):
    """Test deleting a non-existent event"""
    response = client.delete("/api/events/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

