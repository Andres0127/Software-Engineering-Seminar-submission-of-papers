# Event Management Platform - Workshop 3

Complete system for event management with ticket purchasing, user authentication, and location management.

---

## What's Included?

This project has **two main systems** that work together:

1. **User System** (Java) - Handles user registration and authentication
2. **Event System** (Python) - Manages events, tickets, locations, and orders

Both systems have their own databases and can work independently.

---

## Quick Start Guide

### Prerequisites

You need to have installed:
- Java 17 or higher
- Python 3.12 or higher
- MySQL (for users)
- PostgreSQL (for events)

---

## Step-by-Step Installation

### User System (Java)

**Set up MySQL database:**

```sql
# Open MySQL and run:
CREATE DATABASE eventplatform_auth;
```

**Start the server:**

```bash
# Go to the Java project folder
cd java-backend

# Start the server
mvnw.cmd spring-boot:run
```

Server will be available at: **http://localhost:8080**

---

### Event System (Python)

**Set up PostgreSQL database:**

```sql
# Open PostgreSQL and run:
CREATE DATABASE eventplatform;
```

**Start the server:**

```bash
# Go to the Python project folder
cd python-backend

# Activate virtual environment
.\venv\Scripts\activate

# Start the server
uvicorn main:app --reload --port 8000
```

Server will be available at: **http://localhost:8000**

---

## Database Connection

### MySQL Database (User System)

- **Database**: `eventplatform_auth`
- **User**: `root`
- **Password**: Configure your own password
- **Port**: `3306`
- **Server**: `localhost`

**Configuration file:** `java-backend/src/main/resources/application.properties`

**Lines to modify with your credentials:**

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```

---

### PostgreSQL Database (Event System)

- **Database**: `eventplatform`
- **User**: `postgres`
- **Password**: Configure your own password
- **Port**: `5432`
- **Server**: `localhost`

**Configuration file:** `python-backend/.env`

**Line to modify with your credentials:**
````
<userPrompt>
Provide the fully rewritten file, incorporating the suggested code change. You must produce the complete file.
</userPrompt>
