# 📂 Complete Project Structure - Workshop 3

## Overview
This document provides a detailed breakdown of the folder structure and the purpose of each directory.

---

## 🌳 Full Directory Tree

```
Workshop-3/
│
├── 📁 java-backend/                          # JAVA SPRING BOOT - AUTHENTICATION SERVICE
│   │
│   ├── 📁 src/
│   │   ├── 📁 main/
│   │   │   ├── 📁 java/com/eventplatform/
│   │   │   │   │
│   │   │   │   ├── 📁 config/                # Configuration Classes
│   │   │   │   │   ├── SecurityConfig.java   (Spring Security setup)
│   │   │   │   │   ├── CorsConfig.java       (CORS configuration)
│   │   │   │   │   ├── WebConfig.java        (Web MVC configuration)
│   │   │   │   │   └── DatabaseConfig.java   (MySQL connection)
│   │   │   │   │
│   │   │   │   ├── 📁 controller/            # REST API Controllers
│   │   │   │   │   ├── AuthController.java   (login, register, logout)
│   │   │   │   │   ├── UserController.java   (user CRUD)
│   │   │   │   │   └── AdminController.java  (admin operations)
│   │   │   │   │
│   │   │   │   ├── 📁 service/               # Business Logic Layer
│   │   │   │   │   ├── AuthService.java      (authentication logic)
│   │   │   │   │   ├── UserService.java      (user management)
│   │   │   │   │   ├── JwtService.java       (JWT token operations)
│   │   │   │   │   └── EmailService.java     (email notifications)
│   │   │   │   │
│   │   │   │   ├── 📁 repository/            # Data Access Layer (JPA)
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── AdminRepository.java
│   │   │   │   │   ├── OrganizerRepository.java
│   │   │   │   │   └── AuditLogRepository.java
│   │   │   │   │
│   │   │   │   ├── 📁 model/                 # JPA Entities
│   │   │   │   │   ├── User.java             (base user entity)
│   │   │   │   │   ├── PlatformAdmin.java    (admin user)
│   │   │   │   │   ├── EventOrganizer.java   (organizer user)
│   │   │   │   │   ├── TicketBuyer.java      (buyer user)
│   │   │   │   │   └── AuditLog.java         (audit trail)
│   │   │   │   │
│   │   │   │   ├── 📁 dto/                   # Data Transfer Objects
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── UserDTO.java
│   │   │   │   │   └── ErrorResponse.java
│   │   │   │   │
│   │   │   │   ├── 📁 security/              # Security Components
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── UserDetailsServiceImpl.java
│   │   │   │   │   └── AuthEntryPoint.java
│   │   │   │   │
│   │   │   │   ├── 📁 exception/             # Exception Handling
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── UnauthorizedException.java
│   │   │   │   │   └── ValidationException.java
│   │   │   │   │
│   │   │   │   ├── 📁 util/                  # Utility Classes
│   │   │   │   │   ├── PasswordEncoder.java
│   │   │   │   │   ├── DateUtil.java
│   │   │   │   │   └── ResponseBuilder.java
│   │   │   │   │
│   │   │   │   └── EventPlatformApplication.java  # Main Spring Boot App
│   │   │   │
│   │   │   └── 📁 resources/                 # Configuration Files
│   │   │       ├── application.properties    (main config)
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       ├── schema.sql                (database schema)
│   │   │       └── data.sql                  (seed data)
│   │   │
│   │   └── 📁 test/                          # Unit & Integration Tests
│   │       └── 📁 java/com/eventplatform/
│   │           ├── AuthControllerTest.java
│   │           ├── UserServiceTest.java
│   │           ├── JwtServiceTest.java
│   │           └── IntegrationTest.java
│   │
│   ├── 📁 scripts/                           # Utility Scripts
│   │   ├── migrate-database.sql              (migrations)
│   │   ├── seed-users.sql                    (test data)
│   │   └── cleanup.sh                        (cleanup scripts)
│   │
│   ├── 📁 docs/                              # Documentation
│   │   ├── API.md                            (API endpoints)
│   │   ├── SECURITY.md                       (security details)
│   │   └── DEPLOYMENT.md                     (deployment guide)
│   │
│   ├── pom.xml                               # Maven dependencies (to create)
│   ├── .gitignore                            # (to create)
│   └── README.md                             # Java backend docs (to create)
│
│
├── 📁 python-backend/                        # PYTHON FASTAPI - BUSINESS LOGIC SERVICE
│   │
│   ├── 📁 app/
│   │   │
│   │   ├── 📁 api/                           # API Layer
│   │   │   └── 📁 v1/
│   │   │       ├── __init__.py
│   │   │       ├── api.py                    (main router)
│   │   │       └── 📁 endpoints/             # Endpoint Modules
│   │   │           ├── __init__.py
│   │   │           ├── events.py             (event CRUD)
│   │   │           ├── tickets.py            (ticket operations)
│   │   │           ├── orders.py             (order management)
│   │   │           ├── payments.py           (payment processing)
│   │   │           ├── reviews.py            (reviews & ratings)
│   │   │           ├── categories.py         (event categories)
│   │   │           ├── locations.py          (venues)
│   │   │           ├── organizer.py          (organizer dashboard)
│   │   │           ├── admin.py              (admin operations)
│   │   │           └── notifications.py      (notification service)
│   │   │
│   │   ├── 📁 core/                          # Core Configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py                     (settings & env vars)
│   │   │   ├── security.py                   (JWT validation)
│   │   │   ├── database.py                   (DB connection)
│   │   │   ├── logging.py                    (logging config)
│   │   │   └── dependencies.py               (dependency injection)
│   │   │
│   │   ├── 📁 models/                        # SQLAlchemy Models
│   │   │   ├── __init__.py
│   │   │   ├── event.py                      (Event model)
│   │   │   ├── ticket.py                     (Ticket, TicketType)
│   │   │   ├── order.py                      (Order model)
│   │   │   ├── payment.py                    (Payment model)
│   │   │   ├── review.py                     (Review model)
│   │   │   ├── category.py                   (Category model)
│   │   │   ├── location.py                   (Location model)
│   │   │   ├── notification.py               (Notification model)
│   │   │   └── report.py                     (Report model)
│   │   │
│   │   ├── 📁 schemas/                       # Pydantic Schemas (Validation)
│   │   │   ├── __init__.py
│   │   │   ├── event.py                      (EventCreate, EventUpdate, EventResponse)
│   │   │   ├── ticket.py                     (TicketCreate, TicketResponse)
│   │   │   ├── order.py                      (OrderCreate, OrderResponse)
│   │   │   ├── payment.py                    (PaymentRequest, PaymentResponse)
│   │   │   ├── review.py                     (ReviewCreate, ReviewResponse)
│   │   │   └── common.py                     (shared schemas)
│   │   │
│   │   ├── 📁 services/                      # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── event_service.py              (event operations)
│   │   │   ├── ticket_service.py             (ticket logic)
│   │   │   ├── order_service.py              (order processing)
│   │   │   ├── payment_service.py            (payment integration)
│   │   │   ├── notification_service.py       (email, SMS)
│   │   │   ├── qr_service.py                 (QR generation)
│   │   │   ├── pdf_service.py                (PDF generation)
│   │   │   └── report_service.py             (analytics)
│   │   │
│   │   ├── 📁 repositories/                  # Data Access Layer
│   │   │   ├── __init__.py
│   │   │   ├── event_repository.py
│   │   │   ├── ticket_repository.py
│   │   │   ├── order_repository.py
│   │   │   ├── payment_repository.py
│   │   │   └── base_repository.py            (generic CRUD)
│   │   │
│   │   ├── 📁 middleware/                    # Middleware Components
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py            (JWT verification)
│   │   │   ├── logging_middleware.py         (request logging)
│   │   │   ├── error_handler.py              (error handling)
│   │   │   └── rate_limiter.py               (rate limiting)
│   │   │
│   │   ├── 📁 utils/                         # Utility Functions
│   │   │   ├── __init__.py
│   │   │   ├── email_util.py                 (email sending)
│   │   │   ├── qr_generator.py               (QR codes)
│   │   │   ├── pdf_generator.py              (PDF tickets)
│   │   │   ├── validators.py                 (custom validators)
│   │   │   └── helpers.py                    (helper functions)
│   │   │
│   │   ├── 📁 db/                            # Database Management
│   │   │   ├── __init__.py
│   │   │   ├── session.py                    (session factory)
│   │   │   ├── base.py                       (declarative base)
│   │   │   └── migrations/                   (Alembic migrations)
│   │   │
│   │   ├── main.py                           # FastAPI Application Entry
│   │   └── __init__.py
│   │
│   ├── 📁 tests/                             # Test Suite
│   │   ├── __init__.py
│   │   ├── conftest.py                       (pytest fixtures)
│   │   ├── test_events.py
│   │   ├── test_tickets.py
│   │   ├── test_orders.py
│   │   ├── test_payments.py
│   │   └── test_integration.py
│   │
│   ├── 📁 scripts/                           # Utility Scripts
│   │   ├── init_db.py                        (initialize database)
│   │   ├── seed_data.py                      (seed test data)
│   │   └── migrate.sh                        (run migrations)
│   │
│   ├── 📁 docs/                              # Documentation
│   │   ├── API.md
│   │   ├── MODELS.md
│   │   └── DEPLOYMENT.md
│   │
│   ├── requirements.txt                      # Python dependencies (to create)
│   ├── .env.example                          # Environment template (to create)
│   ├── .gitignore                            # (to create)
│   ├── alembic.ini                           # Alembic config (to create)
│   └── README.md                             # Python backend docs (to create)
│
│
├── 📁 react-frontend/                        # REACT - USER INTERFACE
│   │
│   ├── 📁 public/                            # Static Assets
│   │   ├── index.html                        (to create)
│   │   ├── favicon.ico                       (to create)
│   │   ├── manifest.json                     (to create)
│   │   └── robots.txt                        (to create)
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 components/                    # React Components
│   │   │   │
│   │   │   ├── 📁 common/                    # Reusable Components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   │
│   │   │   ├── 📁 auth/                      # Authentication Components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   ├── PasswordReset.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── 📁 events/                    # Event Components
│   │   │   │   ├── EventList.jsx
│   │   │   │   ├── EventCard.jsx
│   │   │   │   ├── EventDetail.jsx
│   │   │   │   ├── EventFilters.jsx
│   │   │   │   └── EventSearch.jsx
│   │   │   │
│   │   │   ├── 📁 tickets/                   # Ticket Components
│   │   │   │   ├── TicketTypeList.jsx
│   │   │   │   ├── TicketSelector.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   ├── CheckoutForm.jsx
│   │   │   │   └── TicketConfirmation.jsx
│   │   │   │
│   │   │   ├── 📁 organizer/                 # Organizer Dashboard
│   │   │   │   ├── OrganizerDashboard.jsx
│   │   │   │   ├── CreateEventForm.jsx
│   │   │   │   ├── EventManagement.jsx
│   │   │   │   ├── SalesChart.jsx
│   │   │   │   └── ReportGenerator.jsx
│   │   │   │
│   │   │   └── 📁 admin/                     # Admin Panel
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── EventApproval.jsx
│   │   │       └── AuditLogViewer.jsx
│   │   │
│   │   ├── 📁 pages/                         # Page Components
│   │   │   ├── Home.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── MyTickets.jsx
│   │   │   ├── OrganizerPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   │
│   │   ├── 📁 services/                      # API Service Layer
│   │   │   ├── api.js                        (Axios config)
│   │   │   ├── authService.js                (auth API calls)
│   │   │   ├── eventService.js               (event API calls)
│   │   │   ├── ticketService.js              (ticket API calls)
│   │   │   ├── orderService.js               (order API calls)
│   │   │   ├── paymentService.js             (payment API calls)
│   │   │   └── notificationService.js
│   │   │
│   │   ├── 📁 context/                       # React Context
│   │   │   ├── AuthContext.jsx               (user auth state)
│   │   │   ├── CartContext.jsx               (shopping cart)
│   │   │   ├── NotificationContext.jsx       (notifications)
│   │   │   └── ThemeContext.jsx              (dark/light mode)
│   │   │
│   │   ├── 📁 hooks/                         # Custom Hooks
│   │   │   ├── useAuth.js                    (authentication hook)
│   │   │   ├── useEvents.js                  (event data hook)
│   │   │   ├── useCart.js                    (cart management)
│   │   │   ├── useDebounce.js                (debounce hook)
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── 📁 utils/                         # Utility Functions
│   │   │   ├── validators.js                 (form validation)
│   │   │   ├── formatters.js                 (date, currency format)
│   │   │   ├── constants.js                  (app constants)
│   │   │   └── helpers.js
│   │   │
│   │   ├── 📁 routes/                        # Routing Configuration
│   │   │   ├── AppRoutes.jsx                 (main routes)
│   │   │   ├── PrivateRoute.jsx              (protected routes)
│   │   │   └── PublicRoute.jsx
│   │   │
│   │   ├── 📁 assets/                        # Static Assets
│   │   │   ├── 📁 images/                    # Images
│   │   │   │   ├── logo.png
│   │   │   │   ├── hero-bg.jpg
│   │   │   │   └── placeholder.png
│   │   │   │
│   │   │   └── 📁 styles/                    # Global Styles
│   │   │       ├── globals.css
│   │   │       ├── variables.css
│   │   │       └── themes.css
│   │   │
│   │   ├── App.jsx                           # Main App Component
│   │   ├── index.js                          # Entry Point
│   │   └── setupTests.js                     # Test setup
│   │
│   ├── package.json                          # NPM dependencies (to create)
│   ├── .env.example                          # Environment template (to create)
│   ├── .gitignore                            # (to create)
│   ├── jsconfig.json                         # (to create)
│   └── README.md                             # Frontend docs (to create)
│
│
├── 📁 docker/                                # DOCKER CONFIGURATION
│   ├── java-backend.Dockerfile               # Java container (to create)
│   ├── python-backend.Dockerfile             # Python container (to create)
│   ├── react-frontend.Dockerfile             # React container (to create)
│   ├── docker-compose.yml                    # Orchestration (to create)
│   ├── mysql.env                             # MySQL environment (to create)
│   └── postgres.env                          # PostgreSQL environment (to create)
│
│
├── 📁 docs/                                  # GENERAL DOCUMENTATION
│   ├── API.md                                # Complete API docs (to create)
│   ├── ARCHITECTURE.md                       # Architecture details (to create)
│   ├── DATABASE.md                           # Database schemas (to create)
│   ├── DEPLOYMENT.md                         # Deployment guide (to create)
│   └── DEVELOPMENT.md                        # Development guide (to create)
│
│
├── README.md                                 # Main project documentation ✅
├── STRUCTURE.md                              # This file ✅
└── .gitignore                                # Git ignore rules (to create)
```

---

## 📋 Purpose of Each Directory

### **Java Backend Directories**

| Directory | Purpose |
|-----------|---------|
| `config/` | Spring configuration classes (security, CORS, database) |
| `controller/` | REST API endpoints (handles HTTP requests) |
| `service/` | Business logic implementation |
| `repository/` | Data access layer (JPA repositories) |
| `model/` | JPA entities mapped to database tables |
| `dto/` | Data transfer objects for API requests/responses |
| `security/` | JWT authentication and authorization |
| `exception/` | Custom exceptions and global error handlers |
| `util/` | Helper classes and utilities |

---

### **Python Backend Directories**

| Directory | Purpose |
|-----------|---------|
| `api/v1/endpoints/` | FastAPI route handlers |
| `core/` | Application configuration and settings |
| `models/` | SQLAlchemy ORM models |
| `schemas/` | Pydantic validation schemas |
| `services/` | Business logic layer |
| `repositories/` | Database query abstraction |
| `middleware/` | Request/response interceptors |
| `utils/` | Helper functions (QR, PDF, email) |
| `db/` | Database connection and migrations |

---

### **React Frontend Directories**

| Directory | Purpose |
|-----------|---------|
| `components/common/` | Reusable UI components |
| `components/auth/` | Authentication-related components |
| `components/events/` | Event display and management |
| `components/tickets/` | Ticket purchase flow |
| `components/organizer/` | Organizer dashboard components |
| `components/admin/` | Admin panel components |
| `pages/` | Full page components |
| `services/` | API integration layer |
| `context/` | Global state management |
| `hooks/` | Custom React hooks |
| `routes/` | Application routing |

---

## 🎯 Design Principles Applied

### **1. Separation of Concerns**
- Each layer has a specific responsibility
- Business logic separated from data access
- API layer separated from business logic

### **2. Clean Architecture**
- **Controller → Service → Repository → Model**
- Dependencies point inward
- Easy to test and maintain

### **3. Modularity**
- Each module can be developed independently
- Clear interfaces between components
- Easy to add new features

### **4. Scalability**
- Microservices architecture (Java + Python)
- Stateless APIs (can scale horizontally)
- Database separation for better performance

### **5. Security**
- JWT-based authentication
- Role-based access control
- Input validation at multiple layers

---

## 🔄 Communication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  React Frontend     │
│  (Port 3000)        │
└──────┬──────┬───────┘
       │      │
       │      └────────────────────┐
       │                           │
       ▼                           ▼
┌──────────────────┐    ┌──────────────────────┐
│  Java Backend    │    │  Python Backend      │
│  (Port 8080)     │◄───┤  (Port 8000)         │
│  Authentication  │    │  Business Logic      │
└────────┬─────────┘    └──────────┬───────────┘
         │                         │
         ▼                         ▼
    ┌─────────┐              ┌──────────────┐
    │  MySQL  │              │ PostgreSQL   │
    │  (3306) │              │   (5432)     │
    └─────────┘              └──────────────┘
```

---

## 📦 Files to Create Next

### **Priority 1: Configuration Files**
1. `java-backend/pom.xml` - Maven dependencies
2. `python-backend/requirements.txt` - Python packages
3. `react-frontend/package.json` - NPM packages
4. Environment files (`.env.example`)

### **Priority 2: Application Entry Points**
5. `java-backend/src/main/java/.../EventPlatformApplication.java`
6. `python-backend/app/main.py`
7. `react-frontend/src/index.js`

### **Priority 3: Configuration Files**
8. `java-backend/src/main/resources/application.properties`
9. `python-backend/app/core/config.py`
10. `docker/docker-compose.yml`

---

## ✅ Status

- [x] Folder structure created
- [x] Documentation written
- [ ] Configuration files pending
- [ ] Source code pending
- [ ] Tests pending
- [ ] Docker setup pending

---

**Created by**: Development Team  
**Date**: November 2025  
**Version**: 1.0
