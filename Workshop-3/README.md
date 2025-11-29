# Event Platform - Execution Guide

Step-by-step instructions to run the Event Platform locally.

---

## 📋 Prerequisites

Install the following before running the services:

- ✅ **Java 17+**
- ✅ **Python 3.12+**
- ✅ **Node.js 16+ (includes npm)**
- ✅ **Maven** (or use the bundled `mvnw` wrapper)
- ✅ **MySQL** running locally
- ✅ **PostgreSQL** running locally

**OR use Docker (recommended - no local installations needed)**

- ✅ **Docker Desktop** installed and running

---

## 🐳 Quick Start with Docker (Recommended)

The easiest way to run the entire project is using Docker. You don't need to install Java, Python, Node.js, MySQL or PostgreSQL locally.

### Steps

1. **Make sure Docker Desktop is running**

2. **Build and start all services:**
   ```batch
   cd Workshop-3
   dockerizar-proyecto.bat
   ```
   Select option `[1]` from the menu.

   Or from command line:
   ```batch
   docker-comandos.bat build-up
   ```

3. **Verify services are running:**
   - React Frontend: http://localhost:3000
   - Java Backend API: http://localhost:8081
   - Python Backend API: http://localhost:8000
   - Java Swagger: http://localhost:8081/swagger-ui.html
   - Python Docs: http://localhost:8000/docs

### Service Ports

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Java Backend | 8081 | http://localhost:8081 |
| Python Backend | 8000 | http://localhost:8000 |
| MySQL (Java) | 3307 | localhost:3307 |
| PostgreSQL (Python) | 5433 | localhost:5433 |

### Useful Docker Commands

```batch
# View container status
docker-compose ps

# View logs in real-time
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f java-backend
docker-compose logs -f python-backend
docker-compose logs -f react-frontend

# Stop containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart java-backend
```

---

## 🚀 Manual Setup (Without Docker)

### Database Setup

#### MySQL (Java Backend)

```sql
CREATE DATABASE eventplatform_auth;
```

Default credentials (adjust `java-backend/src/main/resources/application.properties` if needed):
- User: `root`
- Password: (your MySQL password)
- Port: `3306`

#### PostgreSQL (Python Backend)

**Quick Setup:**

```powershell
# Windows (PowerShell)
cd Workshop-3/python-backend/scripts
# Step 1: Create database
psql -U postgres -f 01-create-database.sql
# Step 2: Create schema and data
psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
```

```bash
# Linux/macOS
cd Workshop-3/python-backend/scripts
# Step 1: Create database
psql -U postgres -f 01-create-database.sql
# Step 2: Create schema and data
psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
```

Default credentials (adjust `python-backend/app/core/config.py` or `.env` if needed):
- User: `postgres`
- Password: (your PostgreSQL password)
- Port: `5432`

---

### ☕ Java Backend (Spring Boot)

**Location:** `Workshop-3/java-backend/`

**Configuration:**
- Port: `8081`
- Database: MySQL (`eventplatform_auth`)
- Swagger UI: http://localhost:8081/swagger-ui.html

**Run:**

Windows:
```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

Linux / macOS:
```bash
cd Workshop-3/java-backend
./mvnw spring-boot:run
```

**Verify:**
- Swagger UI: http://localhost:8081/swagger-ui.html

---

### 🐍 Python Backend (FastAPI)

**Location:** `Workshop-3/python-backend/`

**Configuration:**
- Port: `8000`
- Database: PostgreSQL (`eventplatform`)
- API Docs: http://localhost:8000/docs

**Run:**

```powershell
cd Workshop-3/python-backend
poetry install
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:**
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

---

### ⚛️ React Frontend

**Location:** `Workshop-3/react-frontend/`

**Configuration:**
- Port: `3000`
- Java Auth Backend: http://localhost:8081/api
- Python Events Backend: http://localhost:8000/api

**Run:**

```powershell
cd Workshop-3/react-frontend
npm install        # only required once
npm start
```

This launches the dev server and opens http://localhost:3000 automatically.

**Verify:**
- App URL: http://localhost:3000

---

## 🔄 Running All Services Manually

Open three terminal windows:

### Terminal 1 – Java Backend
```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

### Terminal 2 – Python Backend
```powershell
cd Workshop-3/python-backend
poetry install
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3 – React Frontend
```powershell
cd Workshop-3/react-frontend
npm start
```

**Recommended start order:**
1. Java backend (port 8081)
2. Python backend (port 8000)
3. React frontend (port 3000)

---

## ⚠️ Troubleshooting

### Port already in use

```powershell
# Identify conflicting processes
netstat -ano | findstr :8081  # Java
netstat -ano | findstr :8000  # Python
netstat -ano | findstr :3000  # React

# Terminate the blocking process
taskkill /PID <PID> /F
```

### Cannot connect to databases

1. Ensure MySQL/PostgreSQL services are running
2. Verify credentials in configuration files:
   - Java: `java-backend/src/main/resources/application.properties`
   - Python: `python-backend/app/core/config.py` or `.env`
3. Confirm databases exist:
   - MySQL: `eventplatform_auth`
   - PostgreSQL: `eventplatform`

### Docker issues

**Error: "Docker is not available"**
- Make sure Docker Desktop is installed and running
- Verify Docker is in the system PATH

**Error: "Port already in use"**
- Check what process is using the port: `netstat -ano | findstr :8081`
- Stop other containers or services using those ports

**Containers don't start correctly**
- Check logs: `docker-compose logs`
- Try rebuilding: `docker-compose build --no-cache`
- Clean and rebuild: `docker-comandos.bat clean` then `docker-comandos.bat build-up`

---

## 📊 Ports Overview

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Java Backend | 8081 | http://localhost:8081 |
| Python Backend | 8000 | http://localhost:8000 |
| MySQL (Java) | 3307 | localhost:3307 |
| PostgreSQL (Python) | 5433 | localhost:5433 |

**Note:** Ports 3307 and 5433 are used in Docker to avoid conflicts with local MySQL and PostgreSQL installations.
