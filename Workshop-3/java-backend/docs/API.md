# Event Platform - Authentication API Documentation

## Base URL
```
Development: http://localhost:8080
Production: https://api.eventplatform.com
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## API Endpoints

### 1. Authentication

#### 1.1 Register New User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "phoneNumber": "string (optional, E.164 format)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)",
  "userType": "string (required, one of: ADMIN, ORGANIZER, BUYER)",
  "organizationName": "string (optional, required for ORGANIZER)",
  "permissions": "string (optional, for ADMIN)",
  "accessLevel": "string (optional, for ADMIN)"
}
```

**Example Request:**
```json
{
  "name": "Maria Fernandez",
  "email": "maria@example.com",
  "phoneNumber": "+57-310-1234567",
  "password": "SecurePass@123",
  "userType": "ORGANIZER",
  "organizationName": "MF Events"
}
```

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJtYXJpYUBleGFtcGxlLmNvbSIsInJvbGUiOiJST0xFX09SR0FOSVpFUiIsImlhdCI6MTY5OTI3NjgwMCwiZXhwIjoxNjk5MzYzMjAwfQ.signature",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "maria@example.com",
  "name": "Maria Fernandez",
  "role": "ROLE_ORGANIZER",
  "expiresIn": 86400000
}
```

**Error Responses:**

400 Bad Request - Validation Error:
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input data",
  "errors": {
    "email": "Email must be valid",
    "password": "Password must contain at least one uppercase letter..."
  },
  "timestamp": "2025-11-06T10:30:00"
}
```

409 Conflict - Email already exists:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Email already exists: maria@example.com",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 1.2 User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "maria@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "maria@example.com",
  "name": "Maria Fernandez",
  "role": "ROLE_ORGANIZER",
  "expiresIn": 86400000
}
```

**Error Responses:**

401 Unauthorized - Invalid credentials:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "timestamp": "2025-11-06T10:30:00"
}
```

401 Unauthorized - Account suspended:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "User account is SUSPENDED",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 1.3 Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get details of currently authenticated user

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Maria Fernandez",
  "email": "maria@example.com",
  "phoneNumber": "+57-310-1234567",
  "status": "ACTIVE",
  "role": "ROLE_ORGANIZER",
  "createdAt": "2025-11-05T08:00:00",
  "lastLogin": "2025-11-06T10:30:00",
  "organizationName": "MF Events"
}
```

**Error Responses:**

401 Unauthorized - Missing/Invalid token:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 1.4 Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout current user (client should discard token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2. User Management

#### 2.1 Get User by ID

**Endpoint:** `GET /api/users/{id}`

**Description:** Retrieve user details by ID

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (number, required): User ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Maria Fernandez",
  "email": "maria@example.com",
  "phoneNumber": "+57-310-1234567",
  "status": "ACTIVE",
  "role": "ROLE_ORGANIZER",
  "createdAt": "2025-11-05T08:00:00",
  "lastLogin": "2025-11-06T10:30:00",
  "organizationName": "MF Events"
}
```

**Error Responses:**

404 Not Found:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: '999'",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 2.2 Get All Users (Admin Only)

**Endpoint:** `GET /api/users`

**Description:** Retrieve list of all users

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Authorization:** Requires `ROLE_ADMIN`

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@eventplatform.com",
    "status": "ACTIVE",
    "role": "ROLE_ADMIN",
    "createdAt": "2025-11-01T00:00:00"
  },
  {
    "id": 2,
    "name": "Maria Fernandez",
    "email": "maria@example.com",
    "status": "ACTIVE",
    "role": "ROLE_ORGANIZER",
    "createdAt": "2025-11-05T08:00:00",
    "organizationName": "MF Events"
  }
]
```

**Error Responses:**

403 Forbidden - Not admin:
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 2.3 Update User Profile

**Endpoint:** `PUT /api/users/{id}`

**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (number, required): User ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phoneNumber": "string (optional)",
  "organizationName": "string (optional, for organizers)"
}
```

**Example Request:**
```json
{
  "name": "Maria F. Updated",
  "phoneNumber": "+57-320-9876543"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Maria F. Updated",
  "email": "maria@example.com",
  "phoneNumber": "+57-320-9876543",
  "status": "ACTIVE",
  "role": "ROLE_ORGANIZER",
  "createdAt": "2025-11-05T08:00:00",
  "lastLogin": "2025-11-06T10:30:00",
  "organizationName": "MF Events"
}
```

**Authorization:** 
- Users can only update their own profile
- Admins can update any user

**Error Responses:**

403 Forbidden - Not authorized to update this user:
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 2.4 Delete User (Admin Only)

**Endpoint:** `DELETE /api/users/{id}`

**Description:** Delete user account (soft delete)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Path Parameters:**
- `id` (number, required): User ID

**Authorization:** Requires `ROLE_ADMIN`

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**

404 Not Found:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: '999'",
  "timestamp": "2025-11-06T10:30:00"
}
```

403 Forbidden:
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "timestamp": "2025-11-06T10:30:00"
}
```

---

#### 2.5 Get User Statistics (Admin Only)

**Endpoint:** `GET /api/users/statistics`

**Description:** Get user statistics

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Authorization:** Requires `ROLE_ADMIN`

**Success Response (200 OK):**
```json
{
  "total": 150,
  "active": 142,
  "suspended": 8
}
```

---

## Data Models

### User Types

#### Admin User
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "phoneNumber": "+57-300-1234567",
  "status": "ACTIVE",
  "role": "ROLE_ADMIN",
  "permissions": "ALL",
  "accessLevel": "SUPER_ADMIN",
  "createdAt": "2025-11-01T00:00:00",
  "lastLogin": "2025-11-06T10:00:00"
}
```

#### Event Organizer
```json
{
  "id": 2,
  "name": "Maria Fernandez",
  "email": "maria@example.com",
  "phoneNumber": "+57-310-1234567",
  "status": "ACTIVE",
  "role": "ROLE_ORGANIZER",
  "organizationName": "MF Events",
  "createdAt": "2025-11-05T08:00:00",
  "lastLogin": "2025-11-06T10:30:00"
}
```

#### Ticket Buyer
```json
{
  "id": 3,
  "name": "Juan Perez",
  "email": "juan@example.com",
  "phoneNumber": "+57-320-9876543",
  "status": "ACTIVE",
  "role": "ROLE_BUYER",
  "createdAt": "2025-11-04T12:00:00",
  "lastLogin": "2025-11-06T09:00:00"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required/failed |
| 403 | Forbidden - Not authorized to access resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## JWT Token Structure

```json
{
  "sub": "1",
  "email": "maria@example.com",
  "role": "ROLE_ORGANIZER",
  "iat": 1699276800,
  "exp": 1699363200
}
```

**Claims:**
- `sub`: User ID
- `email`: User email
- `role`: User role (ROLE_ADMIN, ROLE_ORGANIZER, ROLE_BUYER)
- `iat`: Issued at (timestamp)
- `exp`: Expiration (timestamp)

---

## Integration with Python Backend

The Python backend should:

1. **Extract token** from Authorization header: `Bearer <token>`
2. **Validate token** using the same JWT secret
3. **Extract claims**: `user_id` from `sub`, `role` from `role`
4. **Verify expiration**: Check `exp` claim

Example Python code:
```python
import jwt
from functools import wraps
from flask import request, jsonify

JWT_SECRET = "your-256-bit-secret-key"  # Same as Java backend

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token or not token.startswith('Bearer '):
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            token = token.split('Bearer ')[1]
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user_id = int(payload['sub'])
            current_user_role = payload['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user_id, current_user_role, *args, **kwargs)
    
    return decorated
```

---

## Frontend Integration Example

### React with Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Register
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Login
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
};
```

---

## Testing with cURL

See README.md for detailed cURL examples.

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Contact:** team@eventplatform.com
