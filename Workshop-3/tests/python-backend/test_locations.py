import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.core.database import get_db
from app.models.base import Base
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
        name="Concert Hall",
        address="123 Main Street, City, State 12345",
        capacity=5000
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location


def test_create_location_success(client):
    """Test creating a new location"""
    location_data = {
        "name": "Stadium",
        "address": "456 Sports Avenue, City, State 67890",
        "capacity": 10000
    }
    
    response = client.post("/api/locations/", json=location_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Stadium"
    assert data["address"] == "456 Sports Avenue, City, State 67890"
    assert data["capacity"] == 10000
    assert "id" in data


def test_create_location_missing_fields(client):
    """Test creating location with missing required fields"""
    location_data = {
        "name": "Incomplete Location"
    }
    
    response = client.post("/api/locations/", json=location_data)
    assert response.status_code == 422  # Validation error


def test_get_location_success(client, sample_location):
    """Test retrieving a location by ID"""
    response = client.get(f"/api/locations/{sample_location.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_location.id
    assert data["name"] == "Concert Hall"
    assert data["address"] == "123 Main Street, City, State 12345"
    assert data["capacity"] == 5000


def test_get_location_not_found(client):
    """Test retrieving a non-existent location"""
    response = client.get("/api/locations/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_locations_success(client, sample_location):
    """Test listing all locations"""
    response = client.get("/api/locations/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(location["id"] == sample_location.id for location in data)


def test_list_locations_empty(client):
    """Test listing locations when none exist"""
    response = client.get("/api/locations/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

