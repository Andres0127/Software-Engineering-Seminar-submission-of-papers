import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta

import sys
import os

# Add backend path to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../python-backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import from app.main since main.py is in the app directory
from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.event import Event
from app.models.location import Location
from app.models.category import Category

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
    from app.utils.auth import require_organizer_or_admin, get_current_user_id, get_current_user_role
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    def override_require_organizer_or_admin():
        return {"sub": "1", "email": "organizer@example.com", "role": "ROLE_ORGANIZER"}
    
    def override_get_current_user_id():
        return 1
    
    def override_get_current_user_role():
        return "ROLE_ORGANIZER"

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_organizer_or_admin] = override_require_organizer_or_admin
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    app.dependency_overrides[get_current_user_role] = override_get_current_user_role
    
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_category(db_session):
    """Create a sample category for testing"""
    category = Category(
        name="Music",
        description="Music events and concerts"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


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
def sample_event(db_session, sample_location, sample_category):
    """Create a sample event for testing"""
    event = Event(
        name="Test Event",
        date=datetime.now() + timedelta(days=30),
        category="Music",
        category_id=sample_category.id,
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


def test_create_event_success(client, sample_location, sample_category):
    """Test creating a new event"""
    event_data = {
        "title": "New Concert",
        "startDate": (datetime.now() + timedelta(days=30)).isoformat(),
        "maxAttendees": 1000,
        "categoryId": sample_category.id,
        "locationId": sample_location.id,
        "ageRestriction": "18+",
        "maxTicketsPerPurchase": 5,
        "ticketPrice": 50.0
    }
    
    response = client.post("/api/events/", json=event_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Concert"
    assert data["name"] == "New Concert"  # name is also set
    assert data["maxAttendees"] == 1000
    assert data["status"].lower() == "draft"
    assert data["locationId"] == sample_location.id
    assert data["categoryId"] == sample_category.id


def test_create_event_missing_fields(client):
    """Test creating event with missing required fields"""
    event_data = {
        "title": "Incomplete Event"
    }
    
    response = client.post("/api/events/", json=event_data, headers={"Authorization": "Bearer mock-token"})
    assert response.status_code == 422  # Validation error


def test_get_event_success(client, sample_event):
    """Test retrieving an event by ID"""
    response = client.get(f"/api/events/{sample_event.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_event.id
    assert data["name"] == "Test Event"
    assert data["title"] == "Test Event"
    assert data["maxAttendees"] == 500


def test_get_event_not_found(client):
    """Test retrieving a non-existent event"""
    response = client.get("/api/events/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_events_success(client, sample_event):
    """Test listing all events"""
    # Note: The API now filters by status, so we need to pass status=published
    response = client.get("/api/events/?status=published")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(event["id"] == sample_event.id for event in data)


def test_update_event_success(client, sample_event, sample_location, sample_category):
    """Test updating an event"""
    update_data = {
        "title": "Updated Event Name",
        "startDate": (datetime.now() + timedelta(days=60)).isoformat(),
        "maxAttendees": 2000,
        "categoryId": sample_category.id,
        "locationId": sample_location.id,
        "ageRestriction": "21+",
        "maxTicketsPerPurchase": 10,
        "ticketPrice": 75.0
    }
    
    response = client.put(f"/api/events/{sample_event.id}", json=update_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Event Name"
    assert data["name"] == "Updated Event Name"
    assert data["maxAttendees"] == 2000


def test_update_event_not_found(client, sample_location, sample_category):
    """Test updating a non-existent event"""
    update_data = {
        "title": "Non-existent Event",
        "startDate": (datetime.now() + timedelta(days=30)).isoformat(),
        "maxAttendees": 100,
        "categoryId": sample_category.id,
        "locationId": sample_location.id,
        "ticketPrice": 50.0
    }
    
    response = client.put("/api/events/999", json=update_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_event_success(client, sample_event):
    """Test deleting an event"""
    response = client.delete(f"/api/events/{sample_event.id}", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"].lower()
    
    # Verify event is deleted - need to pass status filter
    get_response = client.get(f"/api/events/{sample_event.id}?status=published")
    assert get_response.status_code == 404


def test_delete_event_not_found(client):
    """Test deleting a non-existent event"""
    response = client.delete("/api/events/999", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

