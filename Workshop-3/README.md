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

## 🐳 Docker Setup (Recomendado - Más Fácil)

La forma más sencilla de ejecutar todo el proyecto es usando Docker. No necesitas instalar Java, Python, Node.js, MySQL o PostgreSQL localmente.

### Prerequisitos para Docker

- ✅ **Docker Desktop** instalado y ejecutándose
- ✅ **Docker Compose** (incluido en Docker Desktop)

### Scripts Disponibles

#### 1. Script Interactivo (Recomendado)

Ejecuta el script interactivo que incluye un menú con todas las opciones:

```batch
cd Workshop-3
dockerizar-proyecto.bat
```

Este script te permite:
- ✅ Crear y construir todos los contenedores
- ✅ Iniciar/detener contenedores
- ✅ Ver logs de servicios
- ✅ Reconstruir contenedores
- ✅ Limpiar todo el proyecto
- ✅ Entrar a contenedores
- ✅ Y más opciones...

#### 2. Script de Línea de Comandos

Para ejecutar comandos rápidos desde la terminal:

```batch
cd Workshop-3
docker-comandos.bat build-up    # Construir e iniciar
docker-comandos.bat up          # Solo iniciar
docker-comandos.bat down        # Detener
docker-comandos.bat logs        # Ver logs
docker-comandos.bat ps          # Ver estado
docker-comandos.bat clean       # Limpiar todo
```

#### 3. Script Original (Simple)

Para una creación rápida de contenedores:

```batch
cd Workshop-3
crear-contenedores.bat
```

### Pasos Rápidos con Docker

1. **Asegúrate de que Docker Desktop esté ejecutándose**

2. **Construir e iniciar todo:**
   ```batch
   dockerizar-proyecto.bat
   ```
   Selecciona la opción `[1]` del menú.

   O desde línea de comandos:
   ```batch
   docker-comandos.bat build-up
   ```

3. **Verificar que todo esté funcionando:**
   - React Frontend: http://localhost:3000
   - Java Backend API: http://localhost:8081
   - Python Backend API: http://localhost:8000
   - Java Swagger: http://localhost:8081/swagger-ui.html
   - Python Docs: http://localhost:8000/docs

### Puertos de los Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Java Backend | 8081 | http://localhost:8081 |
| Python Backend | 8000 | http://localhost:8000 |
| MySQL (Java) | 3307 | localhost:3307 |
| PostgreSQL (Python) | 5433 | localhost:5433 |

**Nota:** Los puertos 3307 y 5433 se usan para evitar conflictos con instalaciones locales de MySQL y PostgreSQL.

### Comandos Útiles de Docker

```batch
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f java-backend
docker-compose logs -f python-backend
docker-compose logs -f react-frontend

# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (elimina datos de BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart java-backend

# Entrar a un contenedor
docker-compose exec java-backend /bin/sh
docker-compose exec python-backend /bin/sh
docker-compose exec mysql /bin/bash
```

### Solución de Problemas con Docker

**Error: "Docker no está disponible"**
- Asegúrate de que Docker Desktop esté instalado y ejecutándose
- Verifica que Docker esté en el PATH del sistema

**Error: "Puerto ya en uso"**
- Verifica qué proceso está usando el puerto: `netstat -ano | findstr :8081`
- Detén otros contenedores o servicios que puedan estar usando esos puertos

**Los contenedores no inician correctamente**
- Revisa los logs: `docker-compose logs`
- Intenta reconstruir: `docker-compose build --no-cache`
- Limpia todo y vuelve a construir: `docker-comandos.bat clean` luego `docker-comandos.bat build-up`

**Los datos de la base de datos no persisten**
- Los volúmenes de Docker almacenan los datos
- Si ejecutaste `docker-compose down -v`, los datos se perdieron
- Los volúmenes persisten entre reinicios, a menos que uses `-v`

---

## 🗄️ Database Setup (Configuración Manual)

### MySQL (Java Backend)

```sql
CREATE DATABASE eventplatform_auth;
```

Default credentials (adjust `java-backend/src/main/resources/application.properties` if needed):
- User: `root`
- Password: `*****`
- Port: `3306`

### PostgreSQL (Python Backend)

**Quick Setup (Recommended for new installations):**

**Database Setup (Two SQL scripts):**

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

**See `python-backend/scripts/README_DATABASE.md` for detailed instructions.**

This single SQL file (`00-complete-setup.sql`) contains everything: database schema, enums, tables, indexes, and test data.

**Option 2: Automated script (Windows):**

```powershell
cd Workshop-3/python-backend/scripts
.\setup-database.ps1
```

**Option 2: Automated script (easiest - Linux/macOS):**

```bash
cd Workshop-3/python-backend/scripts
chmod +x setup-database.sh
./setup-database.sh
```

**Option 3: Manual single command:**

```bash
psql -U postgres -c "CREATE DATABASE eventplatform;" && psql -U postgres -d eventplatform -f Workshop-3/python-backend/scripts/00-setup-complete-database.sql
```

**Option 4: Manual two steps:**

```bash
# Step 1: Create database
psql -U postgres -c "CREATE DATABASE eventplatform;"

# Step 2: Create schema and load test data
psql -U postgres -d eventplatform -f Workshop-3/python-backend/scripts/00-setup-complete-database.sql
```

This single script creates the entire database schema (tables, enums, indexes) and inserts complete test data for frontend testing:
- 10 categories (Music, Theater, Sports, Conferences, Comedy, Dance, Art, Food & Drink, Technology, Education)
- 14 locations in Bogotá (stadiums, theaters, arenas, convention centers)
- 22 events across all categories
- 32 ticket types with various pricing options

**Note:** All migration scripts have been consolidated into the complete database script. For existing databases with data, you'll need to manually migrate or create a fresh database.

Default credentials (tweak `python-backend/app/core/config.py` or `.env` if necessary):
- User: `postgres`
- Password: `*****`
- Port: `5432`

**See `python-backend/scripts/README_DATABASE.md` for detailed instructions.**

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

## 🗄️ Database Setup

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

To work with location-specific zones, run the new migration:

```powershell
cd Workshop-3/python-backend
psql -U postgres -d eventplatform -f scripts/10-create-location-zones.sql
```

The backend exposes `GET /api/locations/{location_id}/zones` so the frontend can fetch each venue's predefined zone templates.

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

## 🔄 Run All Services Side-by-Side

Open **three different terminals**:

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
