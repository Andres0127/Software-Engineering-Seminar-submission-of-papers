import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.db.database import get_db
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
    from app.utils.auth import require_auth
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    def override_require_auth():
        # Mock authentication - return a valid payload
        return {"sub": "1", "email": "test@example.com", "role": "admin"}

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_auth] = override_require_auth
    
    # Include users router if not already included
    from app.routes import users
    if users.router not in [r for r in app.routes if hasattr(r, 'path')]:
        app.include_router(users.router)
    
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
    
    response = client.post("/api/users/", json=user_data)
    
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
    
    response = client.post("/api/users/", json=user_data)
    
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
    
    response = client.post("/api/users/", json=user_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_type"] == "organizer"
    assert data["organization_name"] == "Test Organization"


def test_get_user_success(client, sample_user):
    """Test retrieving a user by ID"""
    response = client.get(f"/api/users/{sample_user.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_user.id
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"


def test_get_user_not_found(client):
    """Test retrieving a non-existent user"""
    response = client.get("/api/users/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_users_success(client, sample_user):
    """Test listing all users"""
    response = client.get("/api/users/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(user["id"] == sample_user.id for user in data)


def test_list_users_with_pagination(client, sample_user):
    """Test listing users with pagination"""
    response = client.get("/api/users/?skip=0&limit=10")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_user_success(client, sample_user):
    """Test updating a user"""
    update_data = {
        "name": "Updated Name",
        "phone_number": "+1111111111"
    }
    
    response = client.put(f"/api/users/{sample_user.id}", json=update_data)
    
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
    
    response = client.put("/api/users/999", json=update_data)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_user_status(client, sample_user):
    """Test updating user status"""
    update_data = {
        "status": "suspended"
    }
    
    response = client.put(f"/api/users/{sample_user.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "suspended"


def test_delete_user_success(client, sample_user):
    """Test deleting a user"""
    response = client.delete(f"/api/users/{sample_user.id}")
    
    assert response.status_code == 204
    
    # Verify user is deleted
    get_response = client.get(f"/api/users/{sample_user.id}")
    assert get_response.status_code == 404


def test_delete_user_not_found(client):
    """Test deleting a non-existent user"""
    response = client.delete("/api/users/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

