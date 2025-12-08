# Plan de Acción Detallado - Implementación Local

## 🎯 Objetivo
Completar todos los requisitos de los Workshops 3 y 4 trabajando primero en local, antes de desplegar en Docker.

---

## 📋 FASE 1: FUNCIONALIDADES POR IMPLEMENTAR

### 1.1 Tests de Aceptación (Cucumber) - COMPLETAR

#### Estado Actual:
- ✅ Feature file básico: `authentication.feature`
- ✅ Step definitions implementados
- ⚠️ Solo cubre autenticación (registro y login)

#### Tareas Pendientes:

##### A. Crear Feature Files Adicionales

**1. `event_management.feature`** (Organizador)
```gherkin
Feature: Event Management
  As an organizer
  I want to create and manage events
  So that I can offer tickets to buyers

  Scenario: Create a new event
    Given I am logged in as an organizer
    When I create an event with name "Summer Music Festival"
    Then the event should be created successfully
    And the event status should be "draft"

  Scenario: Publish an event
    Given I have created an event "Summer Music Festival"
    When I publish the event
    Then the event status should be "published"
    And the event should be visible to buyers

  Scenario: Update event details
    Given I have created an event "Summer Music Festival"
    When I update the event capacity to 5000
    Then the event capacity should be 5000
```

**2. `ticket_purchase.feature`** (Comprador)
```gherkin
Feature: Ticket Purchase
  As a ticket buyer
  I want to purchase tickets for events
  So that I can attend events

  Scenario: Browse available events
    Given I am logged in as a buyer
    When I view available events
    Then I should see a list of published events

  Scenario: Purchase tickets for an event
    Given I am viewing event "Summer Music Festival"
    And the event has available tickets
    When I purchase 2 tickets
    Then my order should be created
    And I should receive a confirmation
```

**3. `order_management.feature`** (Comprador/Organizador)
```gherkin
Feature: Order Management
  As a user
  I want to manage my orders
  So that I can track my purchases

  Scenario: View my orders
    Given I am logged in as a buyer
    And I have purchased tickets
    When I view my orders
    Then I should see all my orders

  Scenario: Cancel an order
    Given I have an order for "Summer Music Festival"
    When I cancel the order
    Then the order status should be "cancelled"
    And the tickets should be released
```

**4. `dashboard.feature`** (Organizador)
```gherkin
Feature: Organizer Dashboard
  As an organizer
  I want to view my dashboard
  So that I can manage my events and sales

  Scenario: View dashboard statistics
    Given I am logged in as an organizer
    And I have created events
    When I view my dashboard
    Then I should see event statistics
    And I should see sales information
```

##### B. Implementar Step Definitions

**Archivo**: `Workshop-3/tests/java-backend/src/test/java/com/eventplatform/acceptance/EventStepDefinitions.java`

```java
package com.eventplatform.acceptance;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
// ... imports necesarios

public class EventStepDefinitions {
    
    @Given("I am logged in as an organizer")
    public void i_am_logged_in_as_organizer() {
        // Implementar login como organizador
    }
    
    @When("I create an event with name {string}")
    public void i_create_event_with_name(String eventName) {
        // Implementar creación de evento
    }
    
    @Then("the event should be created successfully")
    public void event_should_be_created() {
        // Verificar creación
    }
    
    // ... más step definitions
}
```

**Archivo**: `Workshop-3/tests/java-backend/src/test/java/com/eventplatform/acceptance/TicketPurchaseStepDefinitions.java`

Similar estructura para compra de tickets.

##### C. Ejecutar y Documentar Resultados

```bash
cd Workshop-3/tests/java-backend
mvn clean test
```

**Acciones**:
1. Ejecutar todos los tests de Cucumber
2. Capturar screenshots de resultados
3. Generar reporte HTML (si está configurado)
4. Documentar resultados en `Workshop-4/cucumber/test-results/`

---

### 1.2 Tests de Estrés (JMeter) - IMPLEMENTAR

#### Estado Actual:
- ❌ No hay archivos `.jmx`
- ❌ No hay resultados de tests

#### Tareas Pendientes:

##### A. Instalar JMeter

**Windows:**
```powershell
# Opción 1: Descargar desde https://jmeter.apache.org/download_jmeter.cgi
# Opción 2: Usar Chocolatey
choco install jmeter
```

**Verificar instalación:**
```bash
jmeter --version
```

##### B. Crear Test Plans

**1. Test Plan: Java Backend - Authentication (`java-auth-stress-test.jmx`)**

**Endpoints a probar:**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/users/{id}` - Obtener usuario

**Configuración:**
- Thread Group: 50 usuarios
- Ramp-up: 10 segundos
- Loop Count: 5
- Duration: 2 minutos

**Elementos del Test Plan:**
- HTTP Request Defaults (Base URL: http://localhost:8081)
- HTTP Request: POST /api/auth/register
- HTTP Request: POST /api/auth/login
- HTTP Request: GET /api/users/{id}
- View Results Tree
- Summary Report
- Aggregate Report

**2. Test Plan: Python Backend - Events (`python-events-stress-test.jmx`)**

**Endpoints a probar:**
- `GET /api/events/` - Listar eventos
- `GET /api/events/{id}` - Obtener evento
- `POST /api/orders/` - Crear orden

**Configuración:**
- Thread Group: 100 usuarios
- Ramp-up: 20 segundos
- Loop Count: 10
- Duration: 5 minutos

**3. Test Plan: Python Backend - Orders (`python-orders-stress-test.jmx`)**

**Endpoints a probar:**
- `POST /api/orders/` - Crear orden
- `GET /api/orders/` - Listar órdenes
- `GET /api/orders/{id}` - Obtener orden

**Configuración:**
- Thread Group: 30 usuarios
- Ramp-up: 5 segundos
- Loop Count: 3

##### C. Ejecutar Tests

**Preparación:**
1. Iniciar backends localmente:
   ```bash
   # Terminal 1: Java Backend
   cd Workshop-3/java-backend
   .\mvnw.cmd spring-boot:run
   
   # Terminal 2: Python Backend
   cd Workshop-3/python-backend
   poetry run uvicorn main:app --reload
   ```

2. Verificar que estén funcionando:
   - Java: http://localhost:8081/health
   - Python: http://localhost:8000/api/health

**Ejecución:**
```bash
# Opción 1: GUI
jmeter

# Opción 2: CLI (headless)
jmeter -n -t Workshop-4/jmeter/test-plans/java-auth-stress-test.jmx -l Workshop-4/jmeter/results/java-auth-results.jtl -e -o Workshop-4/jmeter/results/java-auth-report
```

**Tests a ejecutar:**
1. Test con 10 usuarios concurrentes
2. Test con 50 usuarios concurrentes
3. Test con 100 usuarios concurrentes

##### D. Analizar y Documentar Resultados

**Métricas a analizar:**
- Response Time (promedio, mediana, p95, p99)
- Throughput (requests/segundo)
- Error Rate (%)
- Latency
- CPU/Memory usage (opcional)

**Documentar en:**
- `Workshop-4/jmeter/results/analysis-report.md`
- Screenshots de gráficos
- Tablas de resultados

---

### 1.3 CI/CD Pipeline (GitHub Actions) - IMPLEMENTAR

#### Estado Actual:
- ❌ No existe `.github/workflows/ci-cd.yml`
- ❌ No hay evidencia de ejecuciones

#### Tareas Pendientes:

##### A. Crear Estructura de Carpetas

```bash
mkdir -p .github/workflows
```

##### B. Crear Workflow de CI/CD

**Archivo**: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # Job 1: Tests Unitarios Java
  test-java:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: eventplatform_auth
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Maven dependencies
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2
      
      - name: Run unit tests
        working-directory: Workshop-3/tests/java-backend
        run: mvn clean test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: java-test-results
          path: Workshop-3/tests/java-backend/target/surefire-reports/

  # Job 2: Tests Unitarios Python
  test-python:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: eventplatform
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready -U postgres"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python 3.12
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        working-directory: Workshop-3/python-backend
        run: |
          pip install poetry
          poetry install
      
      - name: Run unit tests
        working-directory: Workshop-3/tests/python-backend
        run: |
          pip install -r requirements.txt
          pytest -v --tb=short
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/eventplatform
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: python-test-results
          path: Workshop-3/tests/python-backend/

  # Job 3: Tests de Aceptación (Cucumber)
  test-acceptance:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: eventplatform_auth
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Run acceptance tests
        working-directory: Workshop-3/tests/java-backend
        run: mvn clean test -Dtest=RunCucumberAcceptanceTest
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: acceptance-test-results
          path: Workshop-3/tests/java-backend/target/

  # Job 4: Build Docker Images
  build-docker:
    runs-on: ubuntu-latest
    needs: [test-java, test-python, test-acceptance]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build Java Backend image
        working-directory: Workshop-3/java-backend
        run: docker build -t eventplatform-java-backend:latest .
      
      - name: Build Python Backend image
        working-directory: Workshop-3/python-backend
        run: docker build -t eventplatform-python-backend:latest .
      
      - name: Build React Frontend image
        working-directory: Workshop-3/react-frontend
        run: docker build -t eventplatform-react-frontend:latest .
      
      - name: Test docker-compose
        working-directory: Workshop-3
        run: docker-compose config
```

##### C. Probar Workflow Localmente (Opcional)

**Instalar `act` (simulador de GitHub Actions):**
```bash
# Windows (Chocolatey)
choco install act-cli

# O descargar desde: https://github.com/nektos/act/releases
```

**Ejecutar:**
```bash
act push
```

##### D. Hacer Commit y Verificar

```bash
git add .github/workflows/ci-cd.yml
git commit -m "Add CI/CD pipeline with tests and Docker builds"
git push
```

**Verificar en GitHub:**
1. Ir a la pestaña "Actions" del repositorio
2. Verificar que el workflow se ejecute
3. Capturar screenshots de ejecuciones exitosas
4. Documentar en `Workshop-4/ci-cd/workflow-evidence.md`

---

## 📋 FASE 2: CORRECCIONES Y MEJORAS

### 2.1 Documentación de REST API

#### Tareas:

##### A. Documentar Endpoints de Java Backend

**Archivo**: `Workshop-3/java-backend/docs/API-DOCUMENTATION.md`

**Estructura:**
```markdown
# Java Backend API Documentation

## Base URL
http://localhost:8081/api

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "userType": "BUYER"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "ROLE_BUYER",
  "expiresIn": 86400000
}
```

### POST /auth/login
Authenticate user and get JWT token.

[... más endpoints ...]
```

##### B. Documentar Endpoints de Python Backend

**Archivo**: `Workshop-3/python-backend/docs/API-DOCUMENTATION.md`

Similar estructura para todos los endpoints de Python.

##### C. Actualizar README.md

Agregar sección de API Documentation con links a:
- Swagger UI (Java): http://localhost:8081/swagger-ui.html
- FastAPI Docs (Python): http://localhost:8000/docs
- Documentación detallada en archivos markdown

---

### 2.2 Organizar Estructura de Workshop-4

#### Tareas:

##### A. Crear Estructura de Carpetas

```bash
cd Workshop-4
mkdir -p cucumber/features
mkdir -p cucumber/step-definitions
mkdir -p cucumber/test-results
mkdir -p jmeter/test-plans
mkdir -p jmeter/results
mkdir -p ci-cd/.github/workflows
```

##### B. Mover Archivos Existentes

```bash
# Mover feature files
mv Workshop-3/tests/java-backend/src/test/resources/features/*.feature Workshop-4/cucumber/features/

# Mover step definitions (copiar, no mover)
cp -r Workshop-3/tests/java-backend/src/test/java/com/eventplatform/acceptance/* Workshop-4/cucumber/step-definitions/

# Mover workflow (cuando esté creado)
mv .github/workflows/ci-cd.yml Workshop-4/ci-cd/.github/workflows/
```

##### C. Actualizar README.md de Workshop-4

Agregar secciones con:
- Links a todos los archivos
- Instrucciones de ejecución
- Resultados documentados

---

### 2.3 Aumentar Cobertura de Tests

#### Tareas:

##### A. Identificar Servicios sin Tests

**Python Backend:**
- [ ] `notification_service.py` - Tests unitarios
- [ ] `payment_service.py` (si existe) - Tests unitarios

**Java Backend:**
- [ ] Repositorios - Tests de integración
- [ ] Exception handlers - Tests

##### B. Implementar Tests Faltantes

**Ejemplo: Test para NotificationService**

**Archivo**: `Workshop-3/tests/python-backend/test_notifications.py`

```python
import pytest
from app.services.notification_service import NotificationService
from app.models.notification import Notification
# ... más imports

def test_create_notification():
    # Implementar test
    pass

def test_send_notification():
    # Implementar test
    pass
```

---

## 📋 FASE 3: VERIFICACIÓN Y VALIDACIÓN

### 3.1 Ejecutar Todos los Tests Localmente

#### Checklist:

- [ ] Tests unitarios Java: `mvn test` en `Workshop-3/tests/java-backend`
- [ ] Tests unitarios Python: `pytest` en `Workshop-3/tests/python-backend`
- [ ] Tests de aceptación: `mvn test` con Cucumber
- [ ] Verificar que todos pasen

### 3.2 Verificar Funcionamiento en Docker

#### Checklist:

- [ ] `docker-compose up -d --build`
- [ ] Verificar que todos los servicios inicien correctamente
- [ ] Probar endpoints principales
- [ ] Verificar logs sin errores

### 3.3 Preparar Entrega Final

#### Checklist:

- [ ] Todos los archivos organizados según estructura
- [ ] Documentación completa
- [ ] Screenshots de resultados
- [ ] README.md actualizado
- [ ] Tests ejecutados y documentados

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1: Tests de Aceptación y JMeter
- Día 1-2: Completar feature files de Cucumber
- Día 3-4: Implementar step definitions
- Día 5: Ejecutar y documentar resultados
- Día 6-7: Crear test plans de JMeter y ejecutar

### Semana 2: CI/CD y Documentación
- Día 1-2: Crear workflow de GitHub Actions
- Día 3: Probar y ajustar workflow
- Día 4-5: Completar documentación de APIs
- Día 6: Organizar estructura de Workshop-4
- Día 7: Revisión y ajustes finales

---

## 🔧 HERRAMIENTAS NECESARIAS

### Instalación Requerida:

1. **JMeter**
   - Descargar: https://jmeter.apache.org/download_jmeter.cgi
   - O usar: `choco install jmeter`

2. **GitHub CLI** (opcional, para facilitar trabajo con GitHub)
   - `choco install gh`

3. **act** (opcional, para probar GitHub Actions localmente)
   - Descargar: https://github.com/nektos/act/releases

---

## 📝 NOTAS IMPORTANTES

1. **Trabajar en local primero**: Todos los cambios deben probarse localmente antes de commitear
2. **Commits frecuentes**: Hacer commits pequeños y frecuentes
3. **Documentar todo**: Cada test, cada resultado, debe estar documentado
4. **Screenshots**: Capturar evidencia visual de todo
5. **Backup**: Hacer backup antes de cambios grandes

---

**Última actualización**: Generado automáticamente
**Estado**: Listo para implementación

