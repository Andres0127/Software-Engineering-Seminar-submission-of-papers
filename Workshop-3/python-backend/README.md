# Python Backend - Event Management Service

## Overview

The Python backend is a **FastAPI** microservice responsible for **event management, ticket sales, and order processing** in the Eventify platform. It handles the core business logic for event creation, location management, ticket inventory, and payment processing.

---

## Architecture & Design Decisions

### Technology Stack

- **Framework:** FastAPI 0.115+
- **Language:** Python 3.11+
- **Database:** PostgreSQL 17
- **ORM:** SQLAlchemy 2.x
- **Migrations:** Alembic
- **Documentation:** OpenAPI 3.0 (Swagger)
- **Server:** Uvicorn (ASGI)
- **Validation:** Pydantic v2

### Why FastAPI?

1. **Performance:** Built on Starlette/Uvicorn - one of the fastest Python frameworks
2. **Async Support:** Native async/await for high concurrency
3. **Type Safety:** Automatic validation via Pydantic
4. **Auto Documentation:** OpenAPI/Swagger generated automatically
5. **Modern Python:** Leverages Python 3.11+ features and type hints
6. **Developer Experience:** Interactive docs, auto-completion, and clear error messages

### Why PostgreSQL?

- **JSON Support:** Native JSONB for flexible event metadata
- **ACID Compliance:** Critical for payment and inventory management
- **Complex Queries:** Advanced SQL for analytics and reporting
- **Scalability:** Handles millions of events and orders efficiently
- **Reliability:** Industry-standard for production systems

---

## Architectural Role

In the **microservices architecture** of Eventify, this backend serves as the **Business Logic & Data Management Core**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Eventify Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐  │
│  │   React      │      │  Java Auth   │      │  Python   │  │
│  │  Frontend    │──────┼──────────────┼─────▶│  Backend  │  │
│  │  (Port 3000) │      │  (Port 8081) │      │(Port 8000)│  │
│  └──────────────┘      └──────────────┘      └───────────┘  │
│         │                      │                     │        │
│         │              ┌──────────────┐             │        │
│         │              │    MySQL     │             │        │
│         │              │  (Auth Data) │             │        │
│         │              └──────────────┘             │        │
│         │                                            │        │
│         │                                    ┌──────────────┐│
│         │                                    │  PostgreSQL  ││
│         │                                    │ (Event Data) ││
│         │                                    └──────────────┘│
│         │                                            │        │
│         └────────────── JWT Token ──────────────────┘        │
│                     (Authentication Flow)                    │
└─────────────────────────────────────────────────────────────┘
```

### Responsibilities

1. **Event Management:** Create, update, delete, and search events
2. **Location Management:** Venues, zones, and seating arrangements
3. **Ticket Inventory:** Manage available tickets and pricing tiers
4. **Order Processing:** Handle ticket purchases and reservations
5. **Payment Processing:** Record payment transactions
6. **Notifications:** Event reminders and purchase confirmations
7. **Reviews & Ratings:** User feedback for events
8. **Audit Logging:** Track all data modifications

---

## Project Structure

```
python-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry point
│   ├── core/
│   │   ├── config.py               # Configuration and environment variables
│   │   └── database.py             # Database connection and session management
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py                 # Base model class
│   │   ├── user.py                 # User model (synced from Java backend)
│   │   ├── category.py             # Event categories
│   │   ├── event.py                # Events and event details
│   │   ├── location.py             # Venues and locations
│   │   ├── location_zone.py        # Seating zones within locations
│   │   ├── ticket.py               # Ticket inventory
│   │   ├── order.py                # Customer orders
│   │   ├── payment.py              # Payment transactions
│   │   ├── notification.py         # User notifications
│   │   ├── review.py               # Event reviews and ratings
│   │   └── audit_log.py            # Audit trail for data changes
│   ├── schemas/                    # Pydantic models for validation
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── event.py
│   │   ├── location.py
│   │   ├── location_zone.py
│   │   ├── ticket.py
│   │   ├── order.py
│   │   └── utils.py                # Shared schema utilities
│   ├── routes/                     # API endpoint routers
│   │   ├── users.py                # User management endpoints
│   │   ├── categories.py           # Category endpoints
│   │   ├── events.py               # Event CRUD operations
│   │   ├── locations.py            # Location management
│   │   ├── tickets.py              # Ticket inventory
│   │   └── orders.py               # Order processing
│   └── utils/
│       └── auth.py                 # JWT authentication utilities
├── scripts/
│   ├── 01-create-database.sql      # Database creation script
│   ├── 02-setup-schema-and-data.sql # Schema and seed data
│   └── README_DATABASE.md          # Database setup instructions
├── tests/                          # Pytest test suite
│   ├── conftest.py                 # Test configuration
│   ├── test_categories.py
│   ├── test_events.py
│   ├── test_locations.py
│   ├── test_orders.py
│   ├── test_tickets.py
│   └── test_users.py
├── alembic/                        # Database migrations
│   ├── versions/                   # Migration scripts
│   └── env.py
├── alembic.ini                     # Alembic configuration
├── main.py                         # Application entry point
├── requirements.txt                # Python dependencies
├── pyproject.toml                  # Project metadata
└── Dockerfile                      # Container configuration
```

---

## Key Features

### 1. Async Database Operations

FastAPI + SQLAlchemy 2.x with async support:

```python
@router.get("/events", response_model=List[EventResponse])
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event))
    events = result.scalars().all()
    return events
```

**Why Async?**
- **High Concurrency:** Handle thousands of simultaneous requests
- **Non-Blocking I/O:** Database queries don't block other operations
- **Better Resource Usage:** More efficient than thread-based concurrency

### 2. JWT Integration

Validates tokens issued by Java backend:

```python
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 3. Comprehensive Data Models

**Event Model:**
- Basic info (title, description, dates)
- Pricing and capacity
- Location and organizer references
- Category classification
- Status tracking (draft, published, cancelled)

**Order Model:**
- Multi-ticket purchases
- Payment tracking
- Order status workflow
- User association

**Audit Log:**
- Tracks all data modifications
- Stores old/new values
- User attribution
- Timestamp tracking

### 4. Database Relationships

```
categories (1) ──────── (N) events
                              │
                              ├──── (N) tickets
                              │
locations (1) ──────── (N) events
    │
    └──── (N) location_zones ───── (N) tickets
    
users (1) ──────── (N) events (as organizer)
      │
      └──── (N) orders ──────── (N) tickets
```

### 5. Seed Data

Database comes with 31+ pre-loaded events across categories:
- Music (concerts, festivals)
- Sports (matches, tournaments)
- Theater (plays, musicals)
- Technology (conferences, workshops)
- Business (networking, seminars)

---

## API Endpoints

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | List all events | No |
| GET | `/api/events/{id}` | Get event details | No |
| POST | `/api/events` | Create new event | Yes (Organizer) |
| PUT | `/api/events/{id}` | Update event | Yes (Organizer) |
| DELETE | `/api/events/{id}` | Delete event | Yes (Admin) |
| GET | `/api/events/category/{cat_id}` | Events by category | No |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List all categories | No |
| POST | `/api/categories` | Create category | Yes (Admin) |

### Locations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/locations` | List all venues | No |
| GET | `/api/locations/{id}` | Get location details | No |
| POST | `/api/locations` | Create location | Yes (Admin) |
| GET | `/api/locations/{id}/zones` | Get location zones | No |

### Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets` | List all tickets | No |
| GET | `/api/tickets/event/{event_id}` | Tickets for an event | No |
| POST | `/api/tickets` | Create ticket type | Yes (Organizer) |
| PUT | `/api/tickets/{id}` | Update ticket | Yes (Organizer) |

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | Yes |
| GET | `/api/orders/{id}` | Get order details | Yes |
| GET | `/api/orders/user/{user_id}` | User's orders | Yes |
| PUT | `/api/orders/{id}/status` | Update order status | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List all users | Yes (Admin) |
| GET | `/api/users/{id}` | Get user by ID | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |
| GET | `/` | API information |

---

## Database Schema

### Core Tables

```sql
-- Events table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location_id INTEGER REFERENCES locations(location_id),
    category_id INTEGER REFERENCES categories(category_id),
    organizer_id INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table (inventory)
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(event_id),
    ticket_type VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_quantity INTEGER NOT NULL,
    zone_id INTEGER REFERENCES location_zones(zone_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    user_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:200127@localhost:5432/eventplatform` |
| `JWT_SECRET` | Secret key for JWT validation | (matches Java backend) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `SERVER_HOST` | Server bind address | `0.0.0.0` |
| `SERVER_PORT` | HTTP port | `8000` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

---

## Running the Service

### Prerequisites

- Python 3.11+
- PostgreSQL 17
- Poetry (recommended) or pip

### Local Development

#### Option 1: Using Poetry (Recommended)

1. **Install Poetry:**
   ```powershell
   # Windows PowerShell
   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
   ```

2. **Install Dependencies:**
   ```bash
   cd python-backend
   poetry install
   ```

3. **Setup Database:**
   ```sql
   -- In PostgreSQL:
   CREATE DATABASE eventplatform;
   ```

4. **Initialize Schema:**
   ```bash
   psql -U postgres -d eventplatform -f scripts/01-create-database.sql
   psql -U postgres -d eventplatform -f scripts/02-setup-schema-and-data.sql
   ```

5. **Run Application:**
   ```bash
   # Option A: Activate Poetry shell
   poetry shell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Option B: Run directly with Poetry
   poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Verify:**
   - Health: http://localhost:8000/health
   - Swagger: http://localhost:8000/docs
   - Events: http://localhost:8000/api/events

#### Option 2: Using pip (Alternative)

1. **Create Virtual Environment:**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install Dependencies:**
   ```bash
   # Generate requirements.txt from Poetry if needed
   poetry export -f requirements.txt --output requirements.txt --without-hashes
   
   # Install with pip
   pip install -r requirements.txt
   ```

3. **Follow steps 3-6 from Option 1**

### Docker

The Docker image uses Poetry for dependency management:

```bash
docker build -t eventplatform-python-backend .
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:200127@host.docker.internal:5432/eventplatform \
  eventplatform-python-backend
```

**Note:** The Dockerfile automatically installs dependencies using Poetry and only includes production dependencies for optimal image size.

---

## Dependency Management with Poetry

### Adding Dependencies

```bash
# Add production dependency
poetry add fastapi

# Add development dependency
poetry add --group dev pytest

# Add dependency with extras
poetry add "pydantic[email]"
```

### Updating Dependencies

```bash
# Update all dependencies
poetry update

# Update specific dependency
poetry update fastapi

# Show outdated dependencies
poetry show --outdated
```

### Viewing Dependencies

```bash
# List all installed packages
poetry show

# Show dependency tree
poetry show --tree

# Show specific package info
poetry show fastapi
```

### Lock File

The `poetry.lock` file ensures reproducible installations. **Commit this file to version control.**

```bash
# Update lock file without installing
poetry lock --no-update

# Install exact versions from lock file
poetry install
```

---

## Testing

### Run Tests

#### Using Poetry (Recommended)

```bash
# All tests
poetry run pytest

# With coverage
poetry run pytest --cov=app --cov-report=html

# Specific test file
poetry run pytest tests/test_events.py

# Verbose output
poetry run pytest -v

# Inside Poetry shell
poetry shell
pytest --cov=app --cov-report=html
```

#### Using pip

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_events.py

# Verbose output
pytest -v
```

### Test Coverage

The test suite covers:
- ✅ Event CRUD operations
- ✅ Category management
- ✅ Location and zone queries
- ✅ Ticket inventory
- ✅ Order creation and status updates
- ✅ User authentication integration

---

## Database Migrations

Using Alembic for schema versioning:

```bash
# Create new migration
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View migration history
alembic history
```

---

## Security Considerations

1. **SQL Injection Protection:** SQLAlchemy parameterized queries
2. **XSS Prevention:** Pydantic validation strips malicious input
3. **CORS Configuration:** Restricted to frontend origin
4. **JWT Validation:** Shared secret with Java backend
5. **Password Security:** Not stored directly (delegated to Java backend)
6. **Environment Secrets:** Never committed to version control

---

## Performance Optimizations

1. **Async Database Pool:** Connection pooling via SQLAlchemy
2. **Query Optimization:** Eager loading for relationships
3. **Indexing:** Database indexes on frequently queried columns
4. **Pagination:** Large result sets paginated by default
5. **Caching:** HTTP caching headers for static data
6. **Compression:** Gzip compression for API responses

---

## Integration Points

### With Java Backend

- **Shared JWT Secret:** Both services validate the same tokens
- **User Synchronization:** User table mirrors Java backend structure
- **Stateless Communication:** No direct service-to-service calls required

### With React Frontend

- **RESTful API:** JSON responses consumed by frontend
- **CORS Enabled:** Frontend can make direct API calls
- **Real-time Updates:** WebSocket support for live notifications (future)

---

## Monitoring & Logging

- **Logging:** Python `logging` module with structured logs
- **Metrics:** Built-in `/health` endpoint for container orchestration
- **Error Tracking:** Automatic exception logging with stack traces
- **Database Monitoring:** Query logging in development mode

---

## Future Enhancements

- **GraphQL API:** Flexible queries for complex data relationships
- **Real-time Notifications:** WebSocket for live event updates
- **Search Optimization:** Elasticsearch for full-text event search
- **Image Upload:** S3-compatible storage for event images
- **Email Service:** SendGrid integration for order confirmations
- **Payment Gateway:** Stripe/PayPal integration for real transactions
- **Analytics Dashboard:** Event statistics and sales reports
- **Caching Layer:** Redis for frequently accessed data

---

## Troubleshooting

### Common Issues

**Problem:** `ModuleNotFoundError: No module named 'app'`
```bash
# Solution: Run from project root
cd python-backend
uvicorn app.main:app --reload
```

**Problem:** `FATAL: password authentication failed for user "postgres"`
```bash
# Solution: Update DATABASE_URL in app/core/config.py
DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/eventplatform"
```

**Problem:** Database tables don't exist
```bash
# Solution: Run initialization scripts
psql -U postgres -d eventplatform -f scripts/02-setup-schema-and-data.sql
```

---

## License

Part of the Eventify platform - Educational project for Software Engineering Seminar.
