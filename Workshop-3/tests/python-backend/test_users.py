import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../python-backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User, UserType, UserStatus

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
    from app.utils.auth import require_auth, require_admin, http_bearer
    from fastapi.security import HTTPAuthorizationCredentials
    from unittest.mock import MagicMock
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # Create a mock credentials object
    mock_credentials = MagicMock(spec=HTTPAuthorizationCredentials)
    mock_credentials.credentials = "mock-token"
    mock_credentials.scheme = "Bearer"
    
    # Override http_bearer to return our mock credentials
    def override_http_bearer():
        return mock_credentials
    
    def override_require_auth():
        # Mock authentication - return a valid payload
        return {"sub": "1", "email": "test@example.com", "role": "ROLE_ADMIN"}
    
    def override_require_admin():
        # Mock admin authentication
        return {"sub": "1", "email": "test@example.com", "role": "ROLE_ADMIN"}

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[http_bearer] = override_http_bearer
    app.dependency_overrides[require_auth] = override_require_auth
    app.dependency_overrides[require_admin] = override_require_admin
    
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing"""
    user = User(
        name="Test User",
        email="test@example.com",
        phone_number="+1234567890",
        user_type=UserType.BUYER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_create_user_success(client):
    """Test creating a new user"""
    user_data = {
        "name": "New User",
        "email": "newuser@example.com",
        "phone_number": "+9876543210",
        "user_type": "buyer",
        "status": "active"
    }
    
    # Need to provide Authorization header for authenticated endpoints
    response = client.post("/api/users/", json=user_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New User"
    assert data["email"] == "newuser@example.com"
    assert data["phone_number"] == "+9876543210"
    assert data["user_type"] == "buyer"
    assert data["status"] == "active"
    assert "id" in data


def test_create_user_duplicate_email(client, sample_user):
    """Test creating a user with duplicate email"""
    user_data = {
        "name": "Duplicate User",
        "email": sample_user.email,
        "user_type": "buyer"
    }
    
    response = client.post("/api/users/", json=user_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_create_user_organizer(client):
    """Test creating an organizer user"""
    user_data = {
        "name": "Event Organizer",
        "email": "organizer@example.com",
        "user_type": "organizer",
        "organization_name": "Test Organization"
    }
    
    response = client.post("/api/users/", json=user_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_type"] == "organizer"
    assert data["organization_name"] == "Test Organization"


def test_get_user_success(client, sample_user):
    """Test retrieving a user by ID"""
    response = client.get(f"/api/users/{sample_user.id}", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_user.id
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"


def test_get_user_not_found(client):
    """Test retrieving a non-existent user"""
    response = client.get("/api/users/999", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_users_success(client, sample_user):
    """Test listing all users"""
    response = client.get("/api/users/", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(user["id"] == sample_user.id for user in data)


def test_list_users_with_pagination(client, sample_user):
    """Test listing users with pagination"""
    response = client.get("/api/users/?skip=0&limit=10", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_user_success(client, sample_user):
    """Test updating a user"""
    update_data = {
        "name": "Updated Name",
        "phone_number": "+1111111111"
    }
    
    response = client.put(f"/api/users/{sample_user.id}", json=update_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["phone_number"] == "+1111111111"
    assert data["email"] == sample_user.email  # Email should remain unchanged


def test_update_user_not_found(client):
    """Test updating a non-existent user"""
    update_data = {
        "name": "Non-existent User"
    }
    
    response = client.put("/api/users/999", json=update_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_user_status(client, sample_user):
    """Test updating user status"""
    update_data = {
        "status": "suspended"
    }
    
    response = client.put(f"/api/users/{sample_user.id}", json=update_data, headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "suspended"


def test_delete_user_success(client, sample_user):
    """Test deleting a user"""
    response = client.delete(f"/api/users/{sample_user.id}", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 204
    
    # Verify user is deleted
    get_response = client.get(f"/api/users/{sample_user.id}", headers={"Authorization": "Bearer mock-token"})
    assert get_response.status_code == 404


def test_delete_user_not_found(client):
    """Test deleting a non-existent user"""
    response = client.delete("/api/users/999", headers={"Authorization": "Bearer mock-token"})
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

