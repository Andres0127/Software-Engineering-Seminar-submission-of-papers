# Event Platform - Execution Guide

Step-by-step instructions so anyone can start the Java backend, Python backend, and React frontend locally.

---

## 📋 Prerequisites

Install the following before running the services:

- ✅ **Java 17+**
- ✅ **Python 3.12+**
- ✅ **Node.js 16+ (includes npm)**
- ✅ **Maven** (or use the bundled `mvnw` wrapper)
- ✅ **MySQL** running locally
- ✅ **PostgreSQL** running locally

---

## 🗄️ Database Setup

### MySQL (Java Backend)

```sql
CREATE DATABASE eventplatform_auth;
```

Default credentials (adjust `java-backend/src/main/resources/application.properties` if needed):
- User: `root`
- Password: `*****`
- Port: `3306`

### PostgreSQL (Python Backend)

```sql
CREATE DATABASE eventplatform;
```

Default credentials (tweak `python-backend/app/core/config.py` or `.env` if necessary):
- User: `postgres`
- Password: `*****`
- Port: `5432`

---

## ☕ Java Backend (Spring Boot)

### Location

```
Workshop-3/java-backend/
```

### Configuration

- **Port**: `8081`
- **Database**: MySQL (`eventplatform_auth`)
- **Swagger UI**: http://localhost:8081/swagger-ui.html

### Run

**Windows (PowerShell/CMD):**

```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
cd Workshop-3/java-backend
./mvnw spring-boot:run
```

**With Maven installed globally:**

```bash
cd Workshop-3/java-backend
mvn spring-boot:run
```

### Verify

- Swagger UI: http://localhost:8081/swagger-ui.html
- API Docs: http://localhost:8081/api-docs

---

## 🐍 Python Backend (FastAPI)

### Location

```
Workshop-3/python-backend/
```

### Configuration

- **Port**: `8000`
- **Database**: PostgreSQL (`eventplatform`)
- **API Docs**: http://localhost:8000/docs

### Run (Poetry only)

```powershell
# Install Poetry if you still need it
pip install --user poetry

cd Workshop-3/python-backend
poetry install
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Poetry isolates dependencies, so `requirements.txt` is not used for local development.

### Verify

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/api/health

### Order cancellation and refunds

- `POST /api/orders/{id}/cancel` — cancels pending orders and invalidates linked tickets.
- `POST /api/orders/{id}/refund` — accepts a `reason`, marks confirmed orders as refund requested, and cancels tickets (helpful for US-4.2/4.3).
- If you are resuming a database that predates the refund column, run:

```powershell
psql -U postgres -d eventplatform -f scripts/09-add-refund-reason.sql
```

---

## ⚛️ React Frontend

### Location

```
Workshop-3/react-frontend/
```

### Configuration

- **Port**: `3000`
- **Java Auth Backend**: http://localhost:8081/api
- **Python Events Backend**: http://localhost:8000/api

### Run

```powershell
cd Workshop-3/react-frontend
npm install        # only required once
npm start
```

This launches the dev server and opens http://localhost:3000 automatically.

### Verify

- App URL: http://localhost:3000

---

## 🔄 Run All Services Side-by-Side

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

---

## 📊 Ports Overview

| Service | Port | URL |
|---------|------|-----|
| React frontend | 3000 | http://localhost:3000 |
| Java backend | 8081 | http://localhost:8081 |
| Python backend | 8000 | http://localhost:8000 |

---

## ⚠️ Troubleshooting

### Port already in use

```powershell
# Identify conflicting processes
netstat -ano | findstr :8081  # Java
netstat -ano | findstr :8000  # Python
netstat -ano | findstr :3000  # React

# Terminate the blocking PID
taskkill /PID <PID> /F
```

### Poetry issues

If Poetry itself is missing or corrupted:

```powershell
pip install --user poetry
cd Workshop-3/python-backend
poetry install
```

### ModuleNotFoundError in Python

```powershell
cd Workshop-3/python-backend
poetry install
```

### Cannot connect to the databases

1. Ensure MySQL/PostgreSQL services are running.  
2. Double-check the credentials inside the Java and Python configuration files.  
3. Confirm both databases exist:
   - MySQL: `eventplatform_auth`
   - PostgreSQL: `eventplatform`

### Updating the ticket status enum

If FastAPI raises `InvalidTextRepresentation` for `ticketstatus`, run the enum migration before restarting the backend:

```powershell
cd Workshop-3/python-backend
psql -U postgres -d eventplatform -f scripts/08-update-ticket-status.sql
```

---

## 📝 Notes

- **Recommended start order:**
  1. Java backend (port 8081)
  2. Python backend (port 8000)
  3. React frontend (port 3000)

- **Hot reloading:**
  - React: the dev server already hot reloads UI changes
  - Python: uvicorn with `--reload`
  - Java: Spring Boot DevTools (if enabled in the IDE)
# Event Platform - Execution Guide

Step-by-step instructions to start both backends (Java + Python) and the React frontend so anyone can run the platform locally.

---

## 📋 Prerequisites

Install the following before you begin:

- ✅ **Java 17+**
- ✅ **Python 3.12+**
- ✅ **Node.js 16+ (includes npm)**
- ✅ **Maven** (or use the `mvnw` wrapper)
- ✅ **MySQL** running locally
- ✅ **PostgreSQL** running locally

---

## 🗄️ Configuración de Bases de Datos

### MySQL (Java Backend)

Run:
```sql
CREATE DATABASE eventplatform_auth;
```

Default credentials (adjust `java-backend/src/main/resources/application.properties` if needed):
- User: `root`
- Password: `*****`
- Port: `3306`

### PostgreSQL (Python Backend)

Run:
```sql
CREATE DATABASE eventplatform;
```

Default credentials (tweak `python-backend/app/core/config.py` or `.env` if necessary):
- User: `postgres`
- Password: `*****`
- Port: `5432`

---

## ☕ Backend Java (Spring Boot)

### Location
```
Workshop-3/java-backend/
```

### Configuration
- **Port**: `8081`
- **Database**: MySQL (`eventplatform_auth`)
- **Swagger UI**: http://localhost:8081/swagger-ui.html

### Run

**Windows (PowerShell/CMD):**
```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**
```bash
cd Workshop-3/java-backend
./mvnw spring-boot:run
```

**With Maven installed globally:**
```bash
cd Workshop-3/java-backend
mvn spring-boot:run
```

### Verify
- Swagger UI: http://localhost:8081/swagger-ui.html
- API Docs: http://localhost:8081/api-docs

---

## 🐍 Backend Python (FastAPI)

### Location
```
Workshop-3/python-backend/
```

### Configuration
- **Port**: `8000`
- **Database**: PostgreSQL (`eventplatform`)
- **API Docs**: http://localhost:8000/docs

### Run

#### Option 1: Poetry (recommended)
```powershell
# Install Poetry globally if needed
pip install poetry

cd Workshop-3/python-backend
poetry install
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Option 2: Virtual environment + pip
```bash
cd Workshop-3/python-backend
python -m venv .venv
source .venv/bin/activate  # use .venv\\Scripts\\Activate.ps1 on PowerShell or .venv\\Scripts\\activate.bat on cmd
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Verify
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/api/health

---

## ⚛️ Frontend React

### Location
```
Workshop-3/react-frontend/
```

### Configuration
- **Port**: `3000`
- **Java Auth Backend**: http://localhost:8081/api
- **Python Events Backend**: http://localhost:8000/api

### Run
```powershell
cd Workshop-3/react-frontend
npm install        # only the first time
npm start
```

This will launch the dev server and open http://localhost:3000 automatically.

### Verify
- App URL: http://localhost:3000

---

## 🔄 Ejecutar Todo el Sistema

Abre **tres terminales** diferentes:

### Terminal 1 – Java Backend
```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

### Terminal 2 – Python Backend
Use Poetry (recommended) or a virtual environment:

```powershell
cd Workshop-3/python-backend
poetry install
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

If you prefer pip:

```powershell
cd Workshop-3/python-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # or activate.bat on cmd
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3 – React Frontend
```powershell
cd Workshop-3/react-frontend
npm start
```

---

## 📊 Ports overview

| Service | Port | URL |
|---------|------|-----|
| React frontend | 3000 | http://localhost:3000 |
| Java backend | 8081 | http://localhost:8081 |
| Python backend | 8000 | http://localhost:8000 |

---

## ⚠️ Solución de Problemas

## ⚠️ Troubleshooting

### Port already in use

```powershell
# Find the PID listening on the port
netstat -ano | findstr :8081  # Java
netstat -ano | findstr :8000  # Python
netstat -ano | findstr :3000  # React

# Kill the process (replace <PID> with the actual number)
taskkill /PID <PID> /F
```

### Virtual environment won't activate in PowerShell

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

### ModuleNotFoundError in Python

**With Poetry:**
```powershell
poetry install
```

**With pip:**
```powershell
# Activate the virtualenv first
pip install -r requirements.txt
```

### Cannot connect to the database

1. Make sure MySQL/PostgreSQL services are running.  
2. Verify credentials inside the Java and Python configuration files.  
3. Confirm the databases exist:
   - MySQL: `eventplatform_auth`
   - PostgreSQL: `eventplatform`

---

## 📝 Notes

- **Recommended start order:**
  1. Java backend (port 8081)
  2. Python backend (port 8000)
  3. React frontend (port 3000)

- **Hot reloading:**
  - React: built-in hot reload during development
  - Python: use `--reload` when running uvicorn
  - Java: Spring Boot DevTools reload (if enabled)
