# Java Backend - Authentication & User Management Service

## Overview

The Java backend is a **Spring Boot** microservice responsible for **authentication, authorization, and user management** in the Eventify platform. It implements a secure JWT-based authentication system and provides user CRUD operations with role-based access control (RBAC).

---

## Architecture & Design Decisions

### Technology Stack

- **Framework:** Spring Boot 3.x
- **Language:** Java 17
- **Database:** MySQL 8.0
- **Security:** Spring Security + JWT
- **Documentation:** OpenAPI 3.0 (Swagger)
- **Build Tool:** Maven
- **ORM:** Spring Data JPA / Hibernate

### Why Spring Boot?

1. **Mature Ecosystem:** Spring Boot provides battle-tested solutions for enterprise applications
2. **Security First:** Spring Security is industry-standard for authentication and authorization
3. **Java Expertise:** Leverages strong typing and robust error handling
4. **Enterprise Ready:** Built-in support for transactions, caching, and monitoring
5. **Microservices Support:** Excellent for building scalable, independent services

### Why MySQL for Authentication?

- **ACID Compliance:** Critical for user data integrity
- **Relational Structure:** User roles and permissions fit naturally in a relational model
- **Wide Adoption:** Well-documented and widely supported
- **Performance:** Optimized for read-heavy operations (authentication checks)

---

## Architectural Role

In the **microservices architecture** of Eventify, this backend serves as the **Authentication & Authorization Gateway**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Eventify Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐  │
│  │   React      │─────▶│  Java Auth   │      │  Python   │  │
│  │  Frontend    │      │   Backend    │      │  Backend  │  │
│  │  (Port 3000) │      │  (Port 8081) │      │(Port 8000)│  │
│  └──────────────┘      └──────────────┘      └───────────┘  │
│         │                      │                     │        │
│         │                      ▼                     │        │
│         │              ┌──────────────┐             │        │
│         │              │    MySQL     │             │        │
│         │              │  (Auth Data) │             │        │
│         │              └──────────────┘             │        │
│         │                                            │        │
│         └────────────── JWT Token ──────────────────┘        │
│                     (Shared Authentication)                  │
└─────────────────────────────────────────────────────────────┘
```

### Responsibilities

1. **User Registration & Login:** Handles user creation and authentication
2. **JWT Token Generation:** Issues secure tokens for authenticated users
3. **User Profile Management:** CRUD operations for user accounts
4. **Role-Based Access Control:** Manages user roles (Admin, Organizer, Buyer)
5. **Security Gateway:** Validates credentials and enforces security policies

---

## Project Structure

```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/eventplatform/
│   │   │       ├── config/              # Configuration classes
│   │   │       │   ├── CorsConfig.java
│   │   │       │   ├── OpenAPIConfig.java
│   │   │       │   └── SecurityConfig.java
│   │   │       ├── controller/          # REST endpoints
│   │   │       │   ├── AuthController.java
│   │   │       │   └── HomeController.java
│   │   │       ├── dto/                 # Data Transfer Objects
│   │   │       │   ├── AuthResponse.java
│   │   │       │   ├── LoginRequest.java
│   │   │       │   └── RegisterRequest.java
│   │   │       ├── exception/           # Custom exceptions
│   │   │       ├── model/               # JPA entities
│   │   │       │   ├── User.java
│   │   │       │   ├── PlatformAdmin.java
│   │   │       │   ├── EventOrganizer.java
│   │   │       │   └── TicketBuyer.java
│   │   │       ├── repository/          # Data access layer
│   │   │       │   └── UserRepository.java
│   │   │       ├── security/            # Security components
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   └── JwtTokenProvider.java
│   │   │       ├── service/             # Business logic
│   │   │       │   └── UserService.java
│   │   │       └── EventPlatformApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-docker.properties
│   │       └── application-prod.properties
│   └── test/                            # Unit & integration tests
├── scripts/                             # Database initialization
│   ├── 01-create-database.sql
│   └── 02-seed-data.sql
├── pom.xml                              # Maven dependencies
└── Dockerfile                           # Container configuration
```

---

## Key Features

### 1. JWT Authentication

- **Token-Based Security:** Stateless authentication using JSON Web Tokens
- **Shared Secret:** Same JWT secret as Python backend for cross-service validation
- **Expiration:** Configurable token lifetime (default: 24 hours)
- **Claims:** User ID, email, and role embedded in token

### 2. Role-Based Access Control (RBAC)

Three user roles with different permissions:

- **ROLE_ADMIN:** Full system access
- **ROLE_ORGANIZER:** Can create and manage events
- **ROLE_BUYER:** Can purchase tickets and view events

### 3. Single Table Inheritance

User entity hierarchy using JPA `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)`:

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public abstract class User {
    // Common fields
}

@Entity
@DiscriminatorValue("ADMIN")
public class PlatformAdmin extends User {
    // Admin-specific fields
}
```

**Why Single Table Inheritance?**
- **Performance:** Single query to fetch user data
- **Simplicity:** No complex joins required
- **Flexibility:** Easy to add new user types

### 4. CORS Configuration

Configured to allow requests from:
- Frontend: `http://localhost:3000`
- Python Backend: `http://localhost:8000`

### 5. OpenAPI Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/api-docs`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### User Management

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | List all users | Yes | Admin |
| GET | `/api/users/{id}` | Get user by ID | Yes | Admin |
| PUT | `/api/users/{id}` | Update user | Yes | Admin |
| DELETE | `/api/users/{id}` | Delete user | Yes | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    organization_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | MySQL connection URL | `jdbc:mysql://localhost:3306/eventplatform_auth` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - |
| `JWT_SECRET` | Secret key for JWT signing | (256-bit secret) |
| `JWT_EXPIRATION` | Token expiration time (ms) | `86400000` (24 hours) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:8000` |
| `SERVER_PORT` | HTTP port | `8081` |

---

## Running the Service

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Local Development

1. **Start MySQL:**
   ```bash
   # Ensure MySQL is running on port 3306
   mysql -u root -p
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE eventplatform_auth;
   ```

3. **Run Application:**
   ```bash
   cd java-backend
   mvn spring-boot:run
   ```

4. **Verify:**
   - Health: http://localhost:8081/health
   - Swagger: http://localhost:8081/swagger-ui.html

### Docker

```bash
docker build -t eventplatform-java-backend .
docker run -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/eventplatform_auth \
  -e SPRING_DATASOURCE_PASSWORD=yourpassword \
  eventplatform-java-backend
```

---

## Testing

Run unit and integration tests:

```bash
mvn test
```

Test coverage:

```bash
mvn jacoco:report
```

---

## Security Considerations

1. **Password Hashing:** BCrypt with salt (strength 12)
2. **SQL Injection Protection:** Parameterized queries via JPA
3. **XSS Protection:** Spring Security defaults
4. **CSRF Protection:** Disabled for stateless API
5. **HTTPS:** Recommended for production
6. **Secret Management:** Environment variables, not hardcoded

---

## Integration with Python Backend

The Java backend shares JWT authentication with the Python backend:

1. **Same JWT Secret:** Both services use identical secret key
2. **Token Validation:** Python backend validates tokens issued by Java
3. **User Context:** JWT payload contains user ID and role
4. **Stateless:** No session sharing required

---

## Performance Optimizations

1. **Connection Pooling:** HikariCP for database connections
2. **JPA Caching:** Second-level cache for user entities
3. **Lazy Loading:** Associations loaded on demand
4. **Indexes:** Database indexes on email and user_type
5. **Stateless Architecture:** Horizontal scaling support

---

## Monitoring & Logging

- **Logging:** SLF4J with Logback
- **Metrics:** Spring Boot Actuator endpoints
- **Health Checks:** `/health` endpoint for container orchestration

---

## Future Enhancements

- OAuth2 integration (Google, Facebook)
- Two-factor authentication (2FA)
- Account verification via email
- Password reset functionality
- Audit logging for security events
- Rate limiting for authentication endpoints

---

## License

Part of the Eventify platform - Educational project for Software Engineering Seminar.
