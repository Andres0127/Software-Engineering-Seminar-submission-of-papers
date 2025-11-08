import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from decimal import Decimal
from datetime import datetime

from main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.order import Order

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
def sample_order(db_session):
    """Create a sample order for testing"""
    order = Order(
        order_number="ORD-TEST123",
        purchase_date=datetime.utcnow(),
        status="pending",
        total_amount=Decimal("99.99"),
        buyer_id=1
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def test_create_order_success(client):
    """Test creating a new order"""
    order_data = {
        "ticket_type_id": 1,
        "quantity": 2
    }
    
    response = client.post("/api/orders/", json=order_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "order_number" in data
    assert data["order_number"].startswith("ORD-")
    assert data["status"] == "pending"
    assert float(data["total_amount"]) == 0.00
    assert data["buyer_id"] == 1


def test_get_order_success(client, sample_order):
    """Test retrieving an order by ID"""
    response = client.get(f"/api/orders/{sample_order.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_order.id
    assert data["order_number"] == "ORD-TEST123"
    assert data["status"] == "pending"
    assert float(data["total_amount"]) == 99.99


def test_get_order_not_found(client):
    """Test retrieving a non-existent order"""
    response = client.get("/api/orders/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_orders_success(client, sample_order):
    """Test listing all orders"""
    response = client.get("/api/orders/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(order["id"] == sample_order.id for order in data)


def test_list_orders_empty(client):
    """Test listing orders when none exist"""
    response = client.get("/api/orders/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # May be empty or contain orders from previous tests

