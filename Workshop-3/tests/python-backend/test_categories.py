import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.core.database import get_db
from app.models.base import Base
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
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
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


def test_create_category_success(client):
    """Test creating a new category"""
    category_data = {
        "name": "Sports",
        "description": "Sports events and competitions"
    }
    
    response = client.post("/api/categories/", json=category_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Sports"
    assert data["description"] == "Sports events and competitions"
    assert "id" in data


def test_create_category_minimal(client):
    """Test creating a category with only required fields"""
    category_data = {
        "name": "Technology"
    }
    
    response = client.post("/api/categories/", json=category_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Technology"
    assert data.get("description") is None


def test_get_category_success(client, sample_category):
    """Test retrieving a category by ID"""
    response = client.get(f"/api/categories/{sample_category.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_category.id
    assert data["name"] == "Music"
    assert data["description"] == "Music events and concerts"


def test_get_category_not_found(client):
    """Test retrieving a non-existent category"""
    response = client.get("/api/categories/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_categories_success(client, sample_category):
    """Test listing all categories"""
    response = client.get("/api/categories/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(category["id"] == sample_category.id for category in data)


def test_list_categories_empty(client):
    """Test listing categories when none exist"""
    response = client.get("/api/categories/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

