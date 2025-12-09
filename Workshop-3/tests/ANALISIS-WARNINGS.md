# Análisis de Warnings en Tests de Python

## Resumen Ejecutivo

Los tests de Python generan **146 warnings** en total. Estos warnings son principalmente de deprecación y no afectan la funcionalidad de los tests, pero indican que el código usa APIs que serán removidas en futuras versiones.

## Desglose de Warnings por Tipo

### 1. PydanticDeprecatedSince20 (Mayoría de los warnings)

**Causa**: Uso de APIs deprecadas de Pydantic V1 que serán removidas en V3.0

#### A. `@validator` decorators (Pydantic V1 style)
- **Ubicación**: `app/schemas/payment.py`
- **Líneas afectadas**: 33, 43, 60, 73, 88, 107
- **Problema**: Uso de `@validator` en lugar de `@field_validator` (Pydantic V2)
- **Impacto**: Se repite múltiples veces durante la importación del módulo

#### B. `dict()` method deprecado
- **Ubicaciones**:
  - `app/routes/categories.py:12` - `category.dict()`
  - `app/routes/locations.py:15` - `location.dict()`
  - `app/routes/tickets.py:32` - `ticket.dict()`
- **Problema**: Debe usar `model_dump()` en lugar de `dict()`
- **Impacto**: Se ejecuta en cada test que crea categorías, ubicaciones o tipos de tickets

#### C. Class-based `config` deprecado
- **Ubicación**: `app/core/config.py:6`
- **Problema**: Uso de `class Config:` en lugar de `model_config = ConfigDict(...)`
- **Impacto**: Se importa una vez al inicio de cada test

### 2. MovedIn20Warning (SQLAlchemy)

**Causa**: Uso de función deprecada de SQLAlchemy 1.x

- **Ubicación**: `app/models/base.py:5`
- **Problema**: Uso de `declarative_base()` en lugar de `sqlalchemy.orm.declarative_base()`
- **Impacto**: Se importa una vez al inicio de cada test que usa modelos

### 3. DeprecationWarning (Python stdlib)

**Causa**: Uso de funciones deprecadas de la biblioteca estándar de Python

#### A. `datetime.utcnow()` deprecado
- **Ubicaciones**:
  - `app/routes/events.py:64`
  - `app/routes/orders.py:71, 112, 116`
  - `test_orders.py:112` (en fixture `sample_order`)
  - `sqlalchemy/sql/schema.py:3624` (uso interno de SQLAlchemy)
- **Problema**: `datetime.utcnow()` está deprecado, debe usar `datetime.now(datetime.UTC)`
- **Impacto**: Se ejecuta en cada test que crea eventos u órdenes

#### B. `HTTP_422_UNPROCESSABLE_ENTITY` deprecado
- **Ubicación**: `starlette/_exception_handler.py:59` (uso interno de Starlette)
- **Problema**: Constante deprecada, debe usar `HTTP_422_UNPROCESSABLE_CONTENT`
- **Impacto**: Se ejecuta cuando hay errores de validación (422) en los tests

## Distribución de Warnings por Archivo de Test

| Archivo de Test | Cantidad de Warnings |
|----------------|---------------------|
| `test_events.py` | 37 warnings |
| `test_tickets.py` | 36 warnings |
| `test_users.py` | 20 warnings |
| `test_orders.py` | 18 warnings |
| `test_categories.py` | 8 warnings |
| `test_locations.py` | 6 warnings |
| **Total** | **146 warnings** |

## Desglose Detallado de Warnings por Fuente

### Warnings Únicos (aparecen una vez por ejecución)

| Archivo | Línea | Tipo | Descripción |
|---------|-------|------|-------------|
| `app/core/config.py` | 6 | PydanticDeprecatedSince20 | Class-based `config` deprecado |
| `app/models/base.py` | 5 | MovedIn20Warning | `declarative_base()` deprecado |
| `app/schemas/payment.py` | 33 | PydanticDeprecatedSince20 | `@validator('card_number')` |
| `app/schemas/payment.py` | 43 | PydanticDeprecatedSince20 | `@validator('card_type')` |
| `app/schemas/payment.py` | 60 | PydanticDeprecatedSince20 | `@validator('person_type')` |
| `app/schemas/payment.py` | 73 | PydanticDeprecatedSince20 | `@validator('wallet_type')` |
| `app/schemas/payment.py` | 88 | PydanticDeprecatedSince20 | `@validator('payment_network')` |
| `app/schemas/payment.py` | 107 | PydanticDeprecatedSince20 | `@validator('payment_method')` |
| `app/routes/categories.py` | 12 | PydanticDeprecatedSince20 | `category.dict()` deprecado |
| `app/routes/locations.py` | 15 | PydanticDeprecatedSince20 | `location.dict()` deprecado |
| `app/routes/tickets.py` | 32 | PydanticDeprecatedSince20 | `ticket.dict()` deprecado |
| `app/routes/events.py` | 64 | DeprecationWarning | `datetime.utcnow()` deprecado |
| `app/routes/orders.py` | 71 | DeprecationWarning | `datetime.utcnow()` deprecado |
| `app/routes/orders.py` | 112 | DeprecationWarning | `datetime.utcnow()` deprecado |
| `app/routes/orders.py` | 116 | DeprecationWarning | `datetime.utcnow()` deprecado |
| `test_orders.py` | 112 | DeprecationWarning | `datetime.utcnow()` en fixture |
| `sqlalchemy/sql/schema.py` | 3624 | DeprecationWarning | Uso interno de SQLAlchemy |
| `starlette/_exception_handler.py` | 59 | DeprecationWarning | `HTTP_422_UNPROCESSABLE_ENTITY` deprecado |

### Por qué hay 146 warnings si solo hay 17 fuentes únicas?

Los warnings se multiplican porque:

1. **Cada test importa los módulos**: Los warnings de `payment.py` (6 validators) se generan cada vez que se importa el módulo, y cada test puede importarlo múltiples veces.

2. **Warnings en fixtures**: El fixture `sample_order` en `test_orders.py` usa `datetime.utcnow()`, y este fixture se ejecuta en múltiples tests.

3. **Warnings en rutas**: Cada vez que se ejecuta un endpoint (crear categoría, ubicación, ticket), se genera el warning de `dict()`.

4. **Warnings de SQLAlchemy**: El warning de `declarative_base()` se genera cada vez que se importa un modelo, y hay múltiples modelos.

5. **Warnings de validación**: Cada vez que hay un error 422, se genera el warning de Starlette.

### Cálculo aproximado:

- **test_events.py (37 warnings)**:
  - 6 validators de payment.py × múltiples imports = ~30
  - 1 declarative_base = 1
  - 1 config = 1
  - 1 datetime.utcnow() en eventos = 1
  - 1 dict() en tickets (si se crean) = 1
  - Otros = ~3

- **test_tickets.py (36 warnings)**:
  - Similar a events, pero más uso de tickets = más warnings de dict()

- **test_users.py (20 warnings)**:
  - Menos uso de modelos que generan warnings

- **test_orders.py (18 warnings)**:
  - 3 datetime.utcnow() en routes = 3
  - 1 datetime.utcnow() en fixture = 1
  - 6 validators = 6
  - Otros = 8

## Análisis Detallado

### Warnings que se Repiten por Test

1. **Pydantic validators** (`payment.py`): Se importan 6 validators deprecados cada vez que se importa el módulo
2. **SQLAlchemy declarative_base**: Se importa una vez por test
3. **Pydantic config**: Se importa una vez por test
4. **datetime.utcnow()**: Se ejecuta en cada test que crea eventos/órdenes
5. **dict() method**: Se ejecuta en cada test que crea categorías/ubicaciones/tickets

### Multiplicación de Warnings

Los warnings se multiplican porque:
- Cada test importa los módulos que contienen código deprecado
- Algunos warnings se generan múltiples veces durante la ejecución de un test
- Los fixtures también generan warnings cuando se ejecutan

## Recomendaciones para Corregir los Warnings

### Prioridad Alta (Fácil de corregir)

1. **Reemplazar `dict()` por `model_dump()`**:
   - `app/routes/categories.py:12`
   - `app/routes/locations.py:15`
   - `app/routes/tickets.py:32`

2. **Reemplazar `datetime.utcnow()` por `datetime.now(datetime.UTC)`**:
   - `app/routes/events.py:64`
   - `app/routes/orders.py:71, 112, 116`
   - `test_orders.py:112`

### Prioridad Media (Requiere más trabajo)

3. **Migrar validators de Pydantic V1 a V2**:
   - `app/schemas/payment.py` - Cambiar `@validator` a `@field_validator`

4. **Actualizar configuración de Pydantic**:
   - `app/core/config.py:6` - Cambiar `class Config:` a `model_config = ConfigDict(...)`

### Prioridad Baja (Dependencias externas)

5. **SQLAlchemy declarative_base**: 
   - `app/models/base.py:5` - Cambiar a `sqlalchemy.orm.declarative_base()`
   - Nota: Esto puede requerir cambios en otros lugares

6. **Starlette HTTP_422**: 
   - Este es un warning interno de Starlette, no se puede corregir directamente
   - Se resolverá cuando Starlette actualice su código

## Impacto en los Tests

**Buenas noticias**: 
- ✅ Todos los tests pasan correctamente (44/44)
- ✅ Los warnings son solo de deprecación, no errores
- ✅ No afectan la funcionalidad actual

**Consideraciones**:
- ⚠️ En futuras versiones de las librerías, estas APIs pueden ser removidas
- ⚠️ Los warnings hacen más difícil identificar problemas reales
- ⚠️ Puede indicar que el código necesita actualización

## Resumen por Categoría

### 1. Pydantic V1 → V2 Migration (Mayoría de warnings)

**Total aproximado: ~120 warnings**

- **6 validators deprecados** en `payment.py` (líneas 33, 43, 60, 73, 88, 107)
  - Cada uno se importa múltiples veces durante los tests
  - **Solución**: Cambiar `@validator` a `@field_validator`
  
- **3 usos de `dict()`** deprecado:
  - `categories.py:12` - `category.dict()`
  - `locations.py:15` - `location.dict()`
  - `tickets.py:32` - `ticket.dict()`
  - **Solución**: Cambiar a `model_dump()`

- **1 config class** deprecado:
  - `config.py:6` - `class Config:`
  - **Solución**: Cambiar a `model_config = ConfigDict(...)`

### 2. SQLAlchemy 1.x → 2.0 Migration

**Total aproximado: ~6 warnings**

- **1 uso de `declarative_base()`** deprecado:
  - `base.py:5`
  - **Solución**: Cambiar a `sqlalchemy.orm.declarative_base()`

### 3. Python stdlib Deprecations

**Total aproximado: ~15 warnings**

- **5 usos de `datetime.utcnow()`**:
  - `events.py:64` (1 vez por test de eventos)
  - `orders.py:71, 112, 116` (3 veces por test de órdenes)
  - `test_orders.py:112` (1 vez por fixture)
  - **Solución**: Cambiar a `datetime.now(datetime.UTC)`

- **1 warning de Starlette** (interno, no corregible directamente):
  - `HTTP_422_UNPROCESSABLE_ENTITY` → `HTTP_422_UNPROCESSABLE_CONTENT`

- **1 warning de SQLAlchemy** (interno, no corregible directamente):
  - Uso interno de `datetime.utcnow()` en SQLAlchemy

## Conclusión

Los **146 warnings** se pueden reducir significativamente corrigiendo:

1. **~120 warnings** migrando de Pydantic V1 a V2:
   - Cambiar 6 `@validator` a `@field_validator`
   - Cambiar 3 `dict()` a `model_dump()`
   - Cambiar 1 `class Config` a `ConfigDict`

2. **~15 warnings** actualizando uso de datetime:
   - Cambiar 5 `datetime.utcnow()` a `datetime.now(datetime.UTC)`

3. **~6 warnings** actualizando SQLAlchemy:
   - Cambiar `declarative_base()` a `sqlalchemy.orm.declarative_base()`

4. **~5 warnings** son de dependencias externas y no se pueden corregir directamente

**Total corregible: ~141 warnings (97%)**

La mayoría son fáciles de corregir y mejorarán la calidad del código y la preparación para futuras versiones de las dependencias.

