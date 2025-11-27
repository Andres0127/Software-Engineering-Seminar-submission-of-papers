from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from jose import jwt
from datetime import datetime, timedelta

def make_token(role='ROLE_ADMIN'):
    payload = {
        'sub': '1',
        'email': 'admin@example.com',
        'role': role,
        'exp': datetime.utcnow() + timedelta(minutes=60),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

client = TestClient(app)
token = make_token()
res = client.get('/api/events/my-events', headers={'Authorization': f'Bearer {token}'})
print(res.status_code)
print(res.text)
