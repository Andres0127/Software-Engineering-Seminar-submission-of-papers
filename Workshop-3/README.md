# Event Platform - Guía de Ejecución

Guía completa para ejecutar los backends (Java y Python) y el frontend (React) del proyecto.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Java 17 o superior**
- ✅ **Python 3.12 o superior**
- ✅ **Node.js 16 o superior** (incluye npm)
- ✅ **Maven** (o usar el wrapper `mvnw`)
- ✅ **MySQL** corriendo
- ✅ **PostgreSQL** corriendo

---

## 🗄️ Configuración de Bases de Datos

### MySQL (Java Backend)

```sql
CREATE DATABASE eventplatform_auth;
```

**Credenciales por defecto** (configurar en `java-backend/src/main/resources/application.properties`):
- Usuario: `root`
- Contraseña: `RootPass`
- Puerto: `3306`

### PostgreSQL (Python Backend)

```sql
CREATE DATABASE eventplatform;
```

**Credenciales por defecto** (configurar en `python-backend/app/core/config.py` o `.env`):
- Usuario: `postgres`
- Contraseña: `postgres`
- Puerto: `5432`

---

## ☕ Backend Java (Spring Boot)

### Ubicación
```
Workshop-3/java-backend/
```

### Configuración
- **Puerto**: `8081`
- **Base de datos**: MySQL (`eventplatform_auth`)
- **Swagger UI**: http://localhost:8081/swagger-ui.html

### Ejecución

**Windows (PowerShell/CMD):**
```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
cd Workshop-3/java-backend
./mvnw spring-boot:run
```

**Con Maven instalado:**
```bash
cd Workshop-3/java-backend
mvn spring-boot:run
```

### Verificar
- Swagger UI: http://localhost:8081/swagger-ui.html
- API Docs: http://localhost:8081/api-docs

---

## 🐍 Backend Python (FastAPI)

### Ubicación
```
Workshop-3/python-backend/
```

### Configuración
- **Puerto**: `8000`
- **Base de datos**: PostgreSQL (`eventplatform`)
- **API Docs**: http://localhost:8000/docs

### Ejecución

**Usando Poetry:**

```powershell
# Instalar Poetry (si no está instalado)
pip install poetry

# Navegar al directorio
cd Workshop-3/python-backend

# Instalar dependencias
poetry install

# Ejecutar servidor (modo desarrollo)
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Nota:** Poetry gestiona automáticamente el entorno virtual. No necesitas crear ni activar un `.venv` manualmente.

### Verificar
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- Health Check: http://localhost:8000/api/health

---

## ⚛️ Frontend React

### Ubicación
```
Workshop-3/react-frontend/
```

### Configuración
- **Puerto**: `3000`
- **Backend Java (Auth)**: http://localhost:8081/api
- **Backend Python (Events)**: http://localhost:8000/api

### Ejecución

```powershell
# Navegar al directorio
cd Workshop-3/react-frontend

# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar servidor de desarrollo
npm start
```

El servidor se iniciará automáticamente y abrirá el navegador en `http://localhost:3000`.

### Verificar
- Aplicación: http://localhost:3000

---

## 🔄 Ejecutar Todo el Sistema

Abre **tres terminales** diferentes:

### Terminal 1 - Java Backend
```powershell
cd Workshop-3\java-backend
.\mvnw.cmd spring-boot:run
```

### Terminal 2 - Python Backend
```powershell
cd Workshop-3\python-backend
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3 - React Frontend
```powershell
cd Workshop-3\react-frontend
npm start
```

---

## 📊 Resumen de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Java Backend | 8081 | http://localhost:8081 |
| Python Backend | 8000 | http://localhost:8000 |

---

## ⚠️ Solución de Problemas

### Puerto ya en uso

**Windows:**
```powershell
# Buscar proceso usando el puerto
netstat -ano | findstr :8081  # Para Java
netstat -ano | findstr :8000  # Para Python
netstat -ano | findstr :3000  # Para React

# Matar el proceso (reemplaza <PID> con el número encontrado)
taskkill /PID <PID> /F
```

### Error: Poetry no encontrado

```powershell
# Instalar Poetry
pip install poetry

# Verificar instalación
poetry --version
```

### Error: ModuleNotFoundError en Python

```powershell
# Reinstalar dependencias con Poetry
poetry install
```

### Error: No se puede conectar a la base de datos

1. Verifica que MySQL/PostgreSQL estén corriendo
2. Verifica las credenciales en los archivos de configuración
3. Verifica que las bases de datos existan:
   - MySQL: `eventplatform_auth`
   - PostgreSQL: `eventplatform`

---

## 📝 Notas

- **Orden recomendado para iniciar:**
  1. Backend Java (puerto 8081)
  2. Backend Python (puerto 8000)
  3. Frontend React (puerto 3000)

- **Recarga automática:**
  - React: Hot Reload automático al guardar archivos
  - Python: Con `--reload` en uvicorn
  - Java: Con Spring Boot DevTools (si está habilitado)
