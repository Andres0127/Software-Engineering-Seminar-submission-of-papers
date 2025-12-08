# Guía de Ejecución Local - Event Platform

Esta guía te ayudará a ejecutar el proyecto completo localmente, sin Docker.

---

## 📋 Prerequisitos

Asegúrate de tener instalado:

- ✅ **Java 17+** - [Descargar](https://adoptium.net/)
- ✅ **Python 3.12+** - [Descargar](https://www.python.org/downloads/)
- ✅ **Node.js 16+** - [Descargar](https://nodejs.org/)
- ✅ **Maven** (o usar el `mvnw` wrapper incluido)
- ✅ **Poetry** (o usar `pip`) - [Instalar Poetry](https://python-poetry.org/docs/#installation)
- ✅ **MySQL** - [Descargar](https://dev.mysql.com/downloads/mysql/)
- ✅ **PostgreSQL** - [Descargar](https://www.postgresql.org/download/)

---

## 🗄️ Paso 1: Configurar Bases de Datos

### MySQL (para Java Backend)

1. **Iniciar MySQL:**
   ```powershell
   # Verificar que MySQL está corriendo
   mysql --version
   ```

2. **Crear la base de datos:**
   ```sql
   mysql -u root -p
   ```
   
   Luego ejecuta:
   ```sql
   CREATE DATABASE eventplatform_auth;
   EXIT;
   ```

3. **Verificar configuración:**
   - Usuario: `root`
   - Password: Tu password de MySQL (por defecto en el código: `RootPass`)
   - Puerto: `3306`
   - Base de datos: `eventplatform_auth`

   **Nota:** Si tu password es diferente, edita `java-backend/src/main/resources/application-local.properties`

### PostgreSQL (para Python Backend)

1. **Iniciar PostgreSQL:**
   ```powershell
   # Verificar que PostgreSQL está corriendo
   psql --version
   ```

2. **Crear la base de datos y esquema:**
   ```powershell
   cd Workshop-3/python-backend/scripts
   
   # Crear base de datos
   psql -U postgres -f 01-create-database.sql
   
   # Crear esquema y datos iniciales
   psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
   ```

3. **Verificar configuración:**
   - Usuario: `postgres`
   - Password: Tu password de PostgreSQL (por defecto en el código: `200127`)
   - Puerto: `5432`
   - Base de datos: `eventplatform`

   **Nota:** Si tu password es diferente, edita `python-backend/app/core/config.py`

---

## 🚀 Paso 2: Ejecutar Servicios

Tienes dos opciones:

### Opción A: Usar el Script Automático (Recomendado)

```powershell
cd Workshop-3
.\ejecutar-local.bat
```

Selecciona la opción `[5]` para iniciar todos los servicios en ventanas separadas.

### Opción B: Ejecutar Manualmente

Abre **3 terminales** diferentes:

#### Terminal 1: Java Backend

```powershell
cd Workshop-3/java-backend
.\mvnw.cmd spring-boot:run
```

**Verificar:**
- Swagger UI: http://localhost:8081/swagger-ui.html
- Health: http://localhost:8081/health

#### Terminal 2: Python Backend

```powershell
cd Workshop-3/python-backend

# Si tienes Poetry instalado:
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Si NO tienes Poetry, usa pip:
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verificar:**
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

#### Terminal 3: React Frontend

```powershell
cd Workshop-3/react-frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo
npm start
```

**Verificar:**
- Aplicación: http://localhost:3000 (se abre automáticamente)

---

## ✅ Paso 3: Verificar que Todo Funciona

### Verificar Backends

1. **Java Backend:**
   - Abre: http://localhost:8081/swagger-ui.html
   - Deberías ver la documentación de la API
   - Prueba el endpoint `/health`

2. **Python Backend:**
   - Abre: http://localhost:8000/docs
   - Deberías ver la documentación de FastAPI
   - Prueba el endpoint `/api/health`

### Verificar Frontend

1. **React Frontend:**
   - Abre: http://localhost:3000
   - Deberías ver la aplicación
   - Intenta registrarte o hacer login

### Probar Integración

1. **Registro de Usuario:**
   - Ve a http://localhost:3000
   - Haz clic en "Register"
   - Completa el formulario
   - Deberías poder registrarte exitosamente

2. **Login:**
   - Usa las credenciales que acabas de crear
   - Deberías poder hacer login y obtener un token JWT

3. **Ver Eventos:**
   - Una vez logueado, deberías poder ver eventos
   - Los eventos vienen del Python Backend

---

## 🔧 Configuración de Credenciales

### Java Backend - MySQL

Si necesitas cambiar las credenciales de MySQL, edita:

**Archivo:** `Workshop-3/java-backend/src/main/resources/application-local.properties`

```properties
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_AQUI
```

### Python Backend - PostgreSQL

Si necesitas cambiar las credenciales de PostgreSQL, edita:

**Archivo:** `Workshop-3/python-backend/app/core/config.py`

```python
POSTGRES_USER: str = "postgres"
POSTGRES_PASSWORD: str = "TU_PASSWORD_AQUI"
```

O crea un archivo `.env` en `Workshop-3/python-backend/`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TU_PASSWORD_AQUI
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=eventplatform
```

---

## ⚠️ Solución de Problemas

### Error: "Port already in use"

Si un puerto está ocupado:

**Windows:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8081
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Terminar el proceso (reemplaza <PID> con el número)
taskkill /PID <PID> /F
```

O usa el script:
```powershell
cd Workshop-3
.\liberar-puerto-8081.bat
```

### Error: "Cannot connect to database"

1. **MySQL:**
   - Verifica que MySQL esté corriendo: `mysql --version`
   - Verifica que la base de datos exista: `mysql -u root -p -e "SHOW DATABASES;"`
   - Verifica credenciales en `application-local.properties`

2. **PostgreSQL:**
   - Verifica que PostgreSQL esté corriendo: `psql --version`
   - Verifica que la base de datos exista: `psql -U postgres -l`
   - Verifica credenciales en `config.py` o `.env`

### Error: "Module not found" (Python)

```powershell
cd Workshop-3/python-backend
pip install -r requirements.txt
```

O con Poetry:
```powershell
poetry install
```

### Error: "npm ERR!" (React)

```powershell
cd Workshop-3/react-frontend
rm -rf node_modules package-lock.json
npm install
```

### Los servicios no se comunican

1. **Verifica que todos los servicios estén corriendo:**
   - Java: http://localhost:8081/health
   - Python: http://localhost:8000/api/health
   - React: http://localhost:3000

2. **Verifica CORS:**
   - Java Backend debe permitir `http://localhost:3000`
   - Python Backend debe permitir `http://localhost:3000`

3. **Verifica las URLs en el frontend:**
   - Revisa `react-frontend/src/services/` para ver las URLs de los backends

---

## 📊 Orden de Inicio Recomendado

1. **Primero:** MySQL y PostgreSQL (bases de datos)
2. **Segundo:** Java Backend (puerto 8081)
3. **Tercero:** Python Backend (puerto 8000)
4. **Cuarto:** React Frontend (puerto 3000)

---

## 🎯 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| React Frontend | http://localhost:3000 | Aplicación principal |
| Java Backend API | http://localhost:8081/api | API de autenticación |
| Java Swagger | http://localhost:8081/swagger-ui.html | Documentación Java API |
| Python Backend API | http://localhost:8000/api | API de eventos/órdenes |
| Python Docs | http://localhost:8000/docs | Documentación Python API |

---

## 💡 Tips

1. **Hot Reload:** Los backends tienen hot reload activado, los cambios se reflejan automáticamente
2. **Logs:** Revisa las terminales para ver logs de errores
3. **Base de Datos:** Los datos persisten entre ejecuciones
4. **Tokens JWT:** Los tokens expiran después de 24 horas (configurable)

---

## ✅ Checklist de Verificación

Antes de considerar que todo funciona:

- [ ] MySQL está corriendo y la base de datos existe
- [ ] PostgreSQL está corriendo y la base de datos existe
- [ ] Java Backend inicia sin errores
- [ ] Python Backend inicia sin errores
- [ ] React Frontend inicia sin errores
- [ ] Puedo acceder a Swagger UI (Java)
- [ ] Puedo acceder a FastAPI Docs (Python)
- [ ] Puedo ver la aplicación en el navegador
- [ ] Puedo registrarme como usuario
- [ ] Puedo hacer login
- [ ] Puedo ver eventos
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en las terminales de los backends

---

**¿Problemas?** Revisa la sección de solución de problemas o los logs en las terminales.

