import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from app.main import app

client = TestClient(app)

def test_create_event():
    event_data = {
        "name": "Test Event",
        "date": datetime.now().isoformat(),
        "category": "Music",
        "capacity": 100,
        "location_id": 1
    }
    response = client.post("/api/events/", json=event_data)
    assert response.status_code == 200
    assert response.json()["name"] == event_data["name"]
