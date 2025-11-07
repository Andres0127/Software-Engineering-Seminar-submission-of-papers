# Event Platform - Java Backend (Authentication Service)

## 📋 Overview

This is the authentication and user management backend service for the Event Platform. It's built with **Spring Boot** and uses **MySQL** as the database.

### Key Features
- ✅ User registration and authentication
- ✅ JWT-based token generation and validation
- ✅ Role-based access control (Admin, Organizer, Buyer)
- ✅ User profile management
- ✅ Audit logging
- ✅ RESTful API with Swagger documentation

---

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: MySQL 8.x
- **Build Tool**: Maven
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA / Hibernate
- **Documentation**: Swagger/OpenAPI 3
- **Testing**: JUnit 5, Mockito

---

## 📁 Project Structure

```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/com/eventplatform/
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── exception/        # Custom exceptions
│   │   │   ├── model/            # JPA entities
│   │   │   ├── repository/       # JPA repositories
│   │   │   ├── security/         # JWT and security
│   │   │   ├── service/          # Business logic
│   │   │   └── EventPlatformApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   └── test/                     # Unit and integration tests
├── scripts/
│   ├── 01-create-database.sql    # Database creation script
│   └── 02-seed-data.sql          # Sample data
├── pom.xml                       # Maven dependencies
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **MySQL 8.x**
- **Maven 3.6+**

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Run the database creation script
source scripts/01-create-database.sql

# (Optional) Load seed data
source scripts/02-seed-data.sql
```

### 2. Configure Application

Edit `src/main/resources/application.properties`:

```properties
# Update database credentials
spring.datasource.url=jdbc:mysql://localhost:3306/eventplatform_auth
spring.datasource.username=your_username
spring.datasource.password=your_password

# Update JWT secret (IMPORTANT: Change in production!)
jwt.secret=your-very-secure-secret-key-here
```

### 3. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start on **http://localhost:8080**

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+57-300-1234567",
  "password": "SecurePassword@123",
  "userType": "BUYER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "ROLE_BUYER",
  "expiresIn": 86400000
}
```

---

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "ROLE_BUYER",
  "expiresIn": 86400000
}
```

---

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+57-300-1234567",
  "status": "ACTIVE",
  "role": "ROLE_BUYER",
  "createdAt": "2025-11-06T10:30:00",
  "lastLogin": "2025-11-06T15:45:00"
}
```

---

### User Management Endpoints

#### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer <your-jwt-token>
```

---

#### Update User Profile
```http
PUT /api/users/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "John Updated",
  "phoneNumber": "+57-310-9876543"
}
```

---

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <admin-jwt-token>
```

---

#### Delete User (Admin Only)
```http
DELETE /api/users/{id}
Authorization: Bearer <admin-jwt-token>
```

---

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### JWT Token Structure

```json
{
  "sub": "1",
  "email": "john@example.com",
  "role": "ROLE_BUYER",
  "iat": 1699276800,
  "exp": 1699363200
}
```

---

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **ROLE_ADMIN** | Platform Administrator | Full access to all endpoints |
| **ROLE_ORGANIZER** | Event Organizer | Create/manage events, view reports |
| **ROLE_BUYER** | Ticket Buyer | Purchase tickets, view events |

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_type VARCHAR(31) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Admin-specific fields
    permissions TEXT,
    access_level VARCHAR(50),
    
    -- Organizer-specific fields
    organization_name VARCHAR(150)
);
```

---

## 📚 API Documentation (Swagger)

Access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

---

## 🧪 Testing

### Run All Tests
```bash
mvn test
```

### Run with Coverage
```bash
mvn clean test jacoco:report
```

Coverage report will be available at `target/site/jacoco/index.html`

---

## 🔧 Configuration

### Environment Profiles

- **Development**: `spring.profiles.active=dev`
- **Production**: `spring.profiles.active=prod`

### Key Configuration Properties

| Property | Description | Default |
|----------|-------------|---------|
| `jwt.secret` | JWT signing secret | (must be changed) |
| `jwt.expiration` | Token expiration (ms) | 86400000 (24h) |
| `spring.datasource.url` | MySQL connection URL | localhost:3306 |

---

## 🔐 Security Best Practices

1. **Change JWT Secret**: Update `jwt.secret` in production
2. **Use HTTPS**: Enable SSL in production
3. **Strong Passwords**: Enforce password policy (min 8 chars, special chars)
4. **Token Expiration**: Configure appropriate expiration time
5. **Input Validation**: All inputs are validated
6. **Password Encryption**: BCrypt with strength 10

---

## 🐞 Troubleshooting

### Database Connection Error

```
Error: Could not connect to MySQL
Solution: Check MySQL is running and credentials are correct
```

### JWT Token Invalid

```
Error: JWT signature does not match
Solution: Ensure jwt.secret is the same across services
```

---

## 📞 Integration with Python Backend

The Python backend validates JWT tokens generated by this service. Ensure:

1. **Same JWT Secret**: Both backends use the same `jwt.secret`
2. **Token Format**: Python backend expects `Bearer <token>` in Authorization header
3. **Claims**: Python backend extracts `userId` and `role` from token

Example Python validation:
```python
import jwt

token = request.headers.get('Authorization').split('Bearer ')[1]
payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
user_id = payload['sub']
role = payload['role']
```

---

## 🌐 CORS Configuration

By default, the following origins are allowed:
- `http://localhost:3000` (React frontend)
- `http://localhost:3001`

To add more origins, update `application.properties`:
```properties
cors.allowed-origins=http://localhost:3000,http://your-frontend.com
```

---

## 📝 Sample Curl Commands

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "userType": "BUYER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 Build for Production

```bash
# Build JAR file
mvn clean package -DskipTests

# Run JAR
java -jar target/event-platform-auth-1.0.0.jar --spring.profiles.active=prod
```

---

## 📄 License

This project is part of an academic assignment for Universidad Distrital Francisco José de Caldas.

---

## 👥 Team

- Carlos Andres Abella
- Daniel Felipe Paez
- Leidy Marcela Morales

**Supervisor**: Carlos Andrés Sierra  
**Institution**: Universidad Distrital Francisco José de Caldas  
**Date**: November 2025
