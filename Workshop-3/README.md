# Eventify - Event Management Platform

## Overview

**Eventify** is a comprehensive event management platform built with a **microservices architecture**. It enables users to browse events, purchase tickets, and manage their bookings, while providing organizers with tools to create and manage events efficiently.

This project demonstrates modern software engineering practices including microservices design, containerization, CI/CD pipelines, and full-stack development with multiple programming languages.

---

## System Architecture

### Microservices Design Pattern

Eventify is architected as three independent services that communicate through RESTful APIs and share authentication via JWT tokens:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Eventify Platform                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend                            │  │
│  │              TypeScript + Tailwind CSS                        │  │
│  │                    Port 3000                                  │  │
│  │                                                               │  │
│  │  • Event browsing and search                                 │  │
│  │  • User authentication UI                                    │  │
│  │  • Ticket selection and checkout                             │  │
│  │  • Responsive design (mobile/tablet/desktop)                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│         │                                      │                     │
│         │ Authentication                       │ Events/Tickets      │
│         │ (Login/Register)                     │ (CRUD operations)   │
│         ▼                                      ▼                     │
│  ┌──────────────────┐              ┌─────────────────────────┐     │
│  │   Java Backend   │              │    Python Backend       │     │
│  │  Spring Boot 3.x │              │      FastAPI            │     │
│  │    Port 8081     │              │       Port 8000         │     │
│  │                  │              │                         │     │
│  │ • JWT Auth       │◄────────────►│ • Event Management      │     │
│  │ • User CRUD      │ Shared JWT   │ • Ticket Inventory      │     │
│  │ • RBAC           │   Secret     │ • Order Processing      │     │
│  │ • Spring Sec.    │              │ • Location Management   │     │
│  └──────────────────┘              └─────────────────────────┘     │
│         │                                      │                     │
│         ▼                                      ▼                     │
│  ┌──────────────────┐              ┌─────────────────────────┐     │
│  │      MySQL       │              │     PostgreSQL          │     │
│  │  eventplatform   │              │    eventplatform        │     │
│  │    _auth         │              │                         │     │
│  │                  │              │ • 31+ Events            │     │
│  │ • Users          │              │ • Categories            │     │
│  │ • Roles          │              │ • Locations & Zones     │     │
│  │ • Permissions    │              │ • Tickets               │     │
│  └──────────────────┘              │ • Orders                │     │
│                                     │ • Payments              │     │
│                                     │ • Reviews               │     │
│                                     │ • Audit Logs            │     │
│                                     └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Why Microservices?

**1. Separation of Concerns**
- **Java Backend:** Handles authentication and authorization - leveraging Spring Security's mature ecosystem
- **Python Backend:** Manages business logic for events, tickets, and orders - using FastAPI's high performance async capabilities
- **React Frontend:** Provides user interface - ensuring a responsive, modern web experience

**2. Technology Optimization**
- Each service uses the **best tool for its specific job**:
  - **Spring Boot (Java):** Industry-standard for enterprise authentication and security
  - **FastAPI (Python):** Excellent for high-performance APIs with complex business logic
  - **React + TypeScript:** Best-in-class for interactive user interfaces

**3. Independent Scalability**
- Services can be scaled independently based on load:
  - Authentication service may need fewer instances
  - Event browsing may require more instances during peak times

**4. Database Isolation**
- **MySQL for Authentication:** ACID compliance critical for user credentials
- **PostgreSQL for Events:** JSONB support for flexible event metadata, complex queries for analytics

**5. Deployment Flexibility**
- Services can be:
  - Deployed on different servers
  - Updated independently without downtime
  - Rolled back individually if issues arise

**6. Team Autonomy**
- Different teams can work on different services
- Technology stack freedom per service
- Independent release cycles

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI component framework |
| **TypeScript** | 4.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Redux Toolkit** | 2.x | State management |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | Latest | Icon library |

### Java Backend (Authentication Service)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.x | Application framework |
| **Java** | 17 | Programming language |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 3.x | Database ORM |
| **MySQL** | 8.0 | Relational database |
| **JWT** | Latest | Stateless authentication tokens |
| **Swagger/OpenAPI** | 3.0 | API documentation |
| **Maven** | 3.8+ | Build tool |

### Python Backend (Event Management Service)

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115+ | Modern async web framework |
| **Python** | 3.11+ | Programming language |
| **PostgreSQL** | 17 | Relational database |
| **SQLAlchemy** | 2.x | Async ORM |
| **Alembic** | Latest | Database migrations |
| **Pydantic** | 2.x | Data validation |
| **Uvicorn** | Latest | ASGI server |
| **PyJWT** | Latest | JWT token validation |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **PostgreSQL Service** | Windows-hosted database service |
| **Git** | Version control |

---

## Project Structure

```
Workshop-3/
├── java-backend/                   # Authentication & User Management Service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/eventplatform/
│   │   │   │   ├── config/         # Security, CORS, OpenAPI config
│   │   │   │   ├── controller/     # REST endpoints
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── repository/     # Data access layer
│   │   │   │   ├── security/       # JWT authentication
│   │   │   │   └── service/        # Business logic
│   │   │   └── resources/
│   │   │       └── application*.properties
│   │   └── test/
│   ├── scripts/
│   │   └── 01-create-database.sql
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md                   # Java backend documentation
│
├── python-backend/                 # Event Management Service
│   ├── app/
│   │   ├── core/                   # Configuration
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── routes/                 # API endpoints
│   │   └── utils/                  # JWT validation
│   ├── scripts/
│   │   ├── 01-create-database.sql
│   │   └── 02-setup-schema-and-data.sql
│   ├── tests/                      # Pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md                   # Python backend documentation
│
├── react-frontend/                 # User Interface
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route components
│   │   ├── services/               # API integration
│   │   ├── store/                  # Redux state
│   │   ├── types/                  # TypeScript definitions
│   │   └── App.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── README.md                   # Frontend documentation
│
├── tests/                          # Integration & E2E tests
│   ├── java-backend/               # Java backend tests
│   └── python-backend/             # Python backend tests
│
├── .github/
│   └── workflows/
│       └── main.yml                # CI/CD pipeline
│
├── docker-compose.yml              # Multi-service orchestration
├── ejecutar-local.bat              # Local execution script
├── dockerizar-proyecto.bat         # Docker management script
└── README.md                       # This file
```

---

## Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker Desktop installed and running

```bash
cd Workshop-3
docker-compose up --build
```

**Access services:**
- Frontend: http://localhost:3000
- Java API: http://localhost:8081
- Python API: http://localhost:8000
- Java Swagger: http://localhost:8081/swagger-ui.html
- Python Docs: http://localhost:8000/docs

### Option 2: Local Development

**Prerequisites:**
- Java 17+, Maven
- Python 3.11+
- Node.js 18+
- MySQL 8.0 running on port 3306
- PostgreSQL 17 running on port 5432

**1. Start Java Backend:**
```bash
cd java-backend
mvn spring-boot:run
```

**2. Start Python Backend:**
```bash
cd python-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**3. Start React Frontend:**
```bash
cd react-frontend
npm install
npm start
```

**4. Initialize Databases:**

MySQL (Java):
```sql
CREATE DATABASE eventplatform_auth;
-- Run scripts/01-create-database.sql
```

PostgreSQL (Python):
```sql
CREATE DATABASE eventplatform;
-- Run scripts/01-create-database.sql
-- Run scripts/02-setup-schema-and-data.sql
```

---

## Authentication Flow

### JWT Token Sharing

Both backends use the **same JWT secret** to enable seamless authentication:

1. **User Login:**
   - Frontend → POST `/api/auth/login` → Java Backend
   - Java validates credentials against MySQL
   - Java issues JWT token with user ID, email, role

2. **Accessing Python Backend:**
   - Frontend includes JWT in `Authorization: Bearer <token>` header
   - Python backend validates token using shared secret
   - Python extracts user context from token claims

3. **Stateless Authentication:**
   - No session storage required
   - Token contains all necessary user information
   - Both backends can independently validate requests

### Security Configuration

**Java Backend (Spring Security):**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

**Python Backend (FastAPI):**
```python
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Database Design

### MySQL Schema (Authentication)

**users** table:
- Stores user credentials (bcrypt-hashed passwords)
- Implements Single Table Inheritance for user types
- Indexes on email and user_type for performance

**User Roles:**
- `ROLE_ADMIN` - Full system access
- `ROLE_ORGANIZER` - Event creation and management
- `ROLE_BUYER` - Ticket purchases

### PostgreSQL Schema (Events)

**Core tables:**
- `events` - Event details, dates, pricing
- `categories` - Event classification (Music, Sports, Theater, etc.)
- `locations` - Venues and addresses
- `location_zones` - Seating sections within venues
- `tickets` - Ticket inventory and pricing tiers
- `orders` - Purchase records
- `payments` - Transaction history
- `reviews` - User feedback
- `audit_logs` - Data modification tracking

**Relationships:**
- Events → Categories (many-to-one)
- Events → Locations (many-to-one)
- Events → Tickets (one-to-many)
- Orders → Tickets (many-to-many)
- Users → Orders (one-to-many)

---

## API Documentation

### Java Backend (Port 8081)

**Interactive Swagger UI:** http://localhost:8081/swagger-ui.html

**Key Endpoints:**
```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Authenticate and get JWT token
GET    /api/auth/me          - Get current user profile
GET    /api/users            - List all users (Admin only)
GET    /health               - Service health check
```

### Python Backend (Port 8000)

**Interactive API Docs:** http://localhost:8000/docs

**Key Endpoints:**
```
# Events
GET    /api/events                     - List all events
GET    /api/events/{id}                - Get event details
POST   /api/events                     - Create event (Organizer)
GET    /api/events/category/{cat_id}   - Events by category

# Tickets
GET    /api/tickets                    - List all tickets
GET    /api/tickets/event/{event_id}   - Tickets for event
POST   /api/tickets                    - Create ticket (Organizer)

# Orders
POST   /api/orders                     - Create order (Authenticated)
GET    /api/orders/{id}                - Get order details
GET    /api/orders/user/{user_id}      - User's order history

# Categories
GET    /api/categories                 - List categories
POST   /api/categories                 - Create category (Admin)

# Locations
GET    /api/locations                  - List venues
GET    /api/locations/{id}/zones       - Location seating zones

# Health
GET    /health                         - Service health check
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Automated testing and deployment on every push to `main`:

**Workflow Steps:**

1. **Setup:**
   - Checkout code
   - Setup Java 17, Python 3.11, Node.js 18
   - Cache dependencies

2. **Database Initialization:**
   - Start PostgreSQL service
   - Run schema creation scripts
   - Seed test data

3. **Java Backend:**
   - Build with Maven
   - Run unit tests
   - Build JAR artifact

4. **Python Backend:**
   - Install dependencies
   - Run Pytest test suite
   - Check test coverage

5. **React Frontend:**
   - Install npm packages
   - Run Jest tests
   - Build production bundle

6. **Docker:**
   - Build all Docker images
   - Push to registry (if configured)

**Status Badge:** See workflow status in repository

---

## Testing Strategy

### Java Backend Tests

- **Unit Tests:** Service layer logic
- **Integration Tests:** Controller endpoints
- **Security Tests:** Authentication flows
- **Repository Tests:** Database operations

```bash
cd java-backend
mvn test
```

### Python Backend Tests

- **Pytest Suite:** Comprehensive API testing
- **Fixture-based:** Shared test database setup
- **Coverage Reporting:** 80%+ code coverage

```bash
cd python-backend
pytest --cov=app --cov-report=html
```

### Frontend Tests

- **Component Tests:** React Testing Library
- **Integration Tests:** User flows
- **Snapshot Tests:** UI regression detection

```bash
cd react-frontend
npm test
```

---

## Docker Configuration

### Multi-Stage Builds

Optimized Dockerfiles for production:

**Java Backend Dockerfile:**
```dockerfile
# Build stage
FROM maven:3.8.6-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Python Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**React Frontend Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

**Services orchestration:**

```yaml
version: '3.8'

services:
  java-backend:
    build: ./java-backend
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/eventplatform_auth
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql

  python-backend:
    build: ./python-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:200127@postgres:5432/eventplatform
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  react-frontend:
    build: ./react-frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_JAVA_API_URL: http://localhost:8081
      REACT_APP_PYTHON_API_URL: http://localhost:8000
    depends_on:
      - java-backend
      - python-backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: eventplatform_auth
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: 200127
      POSTGRES_DB: eventplatform
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  mysql_data:
  postgres_data:
```

---

## Performance Optimizations

### Backend

1. **Connection Pooling:**
   - Java: HikariCP (default in Spring Boot)
   - Python: SQLAlchemy async pool

2. **Database Indexing:**
   - Indexes on foreign keys
   - Composite indexes for common queries

3. **Caching:**
   - JPA second-level cache for user entities
   - HTTP caching headers for static data

4. **Async Operations:**
   - Python backend uses async/await throughout
   - Non-blocking database queries

### Frontend

1. **Code Splitting:**
   - Route-based lazy loading
   - Dynamic imports for heavy components

2. **Bundle Optimization:**
   - Webpack tree shaking
   - Minification and compression

3. **CSS Optimization:**
   - Tailwind PurgeCSS removes unused styles
   - CSS modules prevent naming conflicts

4. **Image Optimization:**
   - WebP format with fallbacks
   - Lazy loading for images

---

## Security Best Practices

1. **Authentication:**
   - BCrypt password hashing (strength 12)
   - JWT tokens with expiration
   - Secure token storage

2. **Authorization:**
   - Role-Based Access Control (RBAC)
   - Endpoint-level permission checks
   - Resource ownership validation

3. **Data Protection:**
   - SQL injection prevention (parameterized queries)
   - XSS protection (React auto-escaping)
   - CSRF protection for state-changing operations

4. **Network Security:**
   - CORS restricted to known origins
   - HTTPS required in production
   - Security headers (CSP, X-Frame-Options)

5. **Secrets Management:**
   - Environment variables for sensitive data
   - No hardcoded credentials
   - `.env` files excluded from version control

---

## Monitoring & Observability

### Health Checks

All services expose `/health` endpoints:
- **Java Backend:** http://localhost:8081/health
- **Python Backend:** http://localhost:8000/health

### Logging

- **Java:** SLF4J with Logback
  - Structured JSON logging
  - Log levels: TRACE, DEBUG, INFO, WARN, ERROR

- **Python:** Built-in logging module
  - Uvicorn access logs
  - Application logs with timestamps

### Metrics

- **Spring Boot Actuator:** Exposes JVM metrics, request counts, response times
- **FastAPI:** Request logging and error tracking

---

## Future Enhancements

### Immediate Roadmap

- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration (Google, Facebook)
- [ ] Event image uploads (S3/Azure Blob Storage)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications (SendGrid)

### Long-term Vision

- [ ] Real-time notifications (WebSocket/Server-Sent Events)
- [ ] Advanced search with Elasticsearch
- [ ] Event analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Kubernetes deployment
- [ ] Multi-region deployment
- [ ] GraphQL API option
- [ ] Machine learning recommendations

---

## Contributing

This is an educational project for the Software Engineering Seminar. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Standards

- **Java:** Follow Google Java Style Guide
- **Python:** PEP 8 compliance
- **TypeScript:** ESLint configuration
- **Commits:** Conventional Commits format

---

## Troubleshooting

### Common Issues

**Docker containers won't start:**
```bash
# Check if ports are already in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8081

# Kill processes using those ports or use different ports
```

**Database connection failed:**
```bash
# Verify databases are running
docker ps

# Check connection strings in configuration files
# Java: application.properties
# Python: app/core/config.py
```

**JWT token errors:**
```bash
# Ensure both backends use the same JWT_SECRET
# Check environment variables or .env files
```

**Frontend can't reach backend:**
```bash
# Verify CORS configuration allows http://localhost:3000
# Check API URLs in frontend .env file
```

---

## License

This project is part of an educational assignment for the Software Engineering Seminar course.

---

## Team

Developed as part of the Software Engineering Seminar - Workshop 3 submission.

---

## Documentation

For detailed information about each component:

- **[Java Backend Documentation](./java-backend/README.md)** - Authentication service architecture and API
- **[Python Backend Documentation](./python-backend/README.md)** - Event management service architecture and API
- **[React Frontend Documentation](./react-frontend/README.md)** - User interface architecture and components

---

## Support

For questions or issues, please open an issue in the GitHub repository.
