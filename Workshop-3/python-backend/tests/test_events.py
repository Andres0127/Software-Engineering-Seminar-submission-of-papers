from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.main import app

client = TestClient(app)


def _make_token(role: str = "ROLE_ORGANIZER") -> str:
    payload = {
        "sub": "1",
        "email": "organizer@example.com",
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def test_create_event():
    category_resp = client.post(
        "/api/categories/",
        json={
            "name": f"Music-{uuid4().hex[:6]}",
            "description": "Experimental music sessions",
        },
    )
    assert category_resp.status_code == 200
    category_id = category_resp.json()["id"]

    location_resp = client.post(
        "/api/locations/",
        json={
            "name": f"Center-{uuid4().hex[:4]}",
            "address": "100 Main Street",
            "capacity": 500,
        },
    )
    assert location_resp.status_code == 200
    location_id = location_resp.json()["id"]

    start_date = datetime.utcnow() + timedelta(minutes=5)
    event_data = {
        "title": "Test Event",
        "name": "Test Event",
        "description": "Test event used by automated checks",
        "startDate": start_date.isoformat(),
        "endDate": (start_date + timedelta(hours=4)).isoformat(),
        "maxAttendees": 150,
        "categoryId": category_id,
        "locationId": location_id,
        "status": "PUBLISHED",
        "ticketPrice": 75000,
    }
    token = _make_token()
    response = client.post("/api/events/", json=event_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["title"] == event_data["title"]
