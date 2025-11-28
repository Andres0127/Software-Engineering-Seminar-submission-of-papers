# Automated Tests Guide

This directory holds the automated tests for both backends that compose the Event Platform project.

## Project Layout

```
tests/
├── java-backend/         # JUnit + Mockito tests for the Java auth service
│   ├── src/test/java/com/eventplatform/
│   │   ├── controller/
│   │   ├── service/
│   │   └── security/
│   └── pom.xml           # Maven configuration for the test runner
├── python-backend/       # Pytest suite for the FastAPI service
│   ├── test_events.py
│   ├── test_tickets.py
│   ├── test_orders.py
│   ├── test_categories.py
│   ├── test_locations.py
│   ├── test_users.py
│   ├── conftest.py
│   └── requirements.txt  # Python requirements for the test suite
└── README.md             # This document
```

## Java Test Suite

### What is Covered

- **AuthServiceTest**: registration flows, duplicate emails, authentication and claim verification
- **UserServiceTest**: CRUD operations, organization updates, soft deletes, and statistics
- **AuthControllerTest & UserControllerTest**: REST endpoints with role-based guards
- **JwtTokenProviderTest**: JWT issuance, claim parsing, and validation logic

Tests use JUnit 5, Mockito, Spring Boot Test, Spring Security Test, and an in-memory H2 database.

### Running the Java Suite

```bash
cd tests/java-backend
mvn clean compile
mvn test
mvn test -X
mvn test jacoco:report
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=AuthServiceTest#testRegister_Success
```

Coverage reports appear in `target/site/jacoco/index.html`.

## Python Test Suite

### Technologies

- **pytest** + **pytest-asyncio** for async-friendly execution
- **httpx** to drive the API
- **SQLAlchemy** for ORM-backed fixtures

### Running the Python Suite

1. Ensure dependencies are installed:

```bash
cd tests/python-backend
pip install -r requirements.txt
```

2. Run pytest:

```bash
pytest
```

Leverage the same PostgreSQL instance used by the Python backend or adapt the fixtures to point to a test database.

## Notes

- The Java suite relies on Maven 3.6+ and JDK 17.
- The Python suite can run inside the Poetry-managed virtual environment from the Python backend.
- Keep test data deterministic by resetting the databases before running each suite.



