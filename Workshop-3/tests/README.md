# Pruebas Unitarias - Event Platform

Este directorio contiene las pruebas unitarias para ambos backends del proyecto Event Platform: Java (Spring Boot) y Python (FastAPI).

## 📁 Estructura del Proyecto

```
tests/
├── java-backend/          # Pruebas unitarias para el backend Java
│   ├── src/
│   │   └── test/
│   │       └── java/
│   │           └── com/
│   │               └── eventplatform/
│   │                   ├── controller/    # Pruebas de controladores REST
│   │                   ├── service/  # Pruebas de servicios de negocio
│   │                   └── security/ # Pruebas de seguridad JWT
│   └── pom.xml           # Configuración Maven para las pruebas
│
├── python-backend/       # Pruebas unitarias para el backend Python
│   ├── test_events.py    # Pruebas de endpoints de eventos
│   ├── test_tickets.py   # Pruebas de endpoints de tickets
│   ├── test_orders.py    # Pruebas de endpoints de órdenes
│   ├── test_categories.py # Pruebas de endpoints de categorías
│   ├── test_locations.py  # Pruebas de endpoints de ubicaciones
│   ├── test_users.py     # Pruebas de endpoints de usuarios
│   ├── conftest.py       # Configuración compartida de pytest
│   └── requirements.txt  # Dependencias de Python para pruebas
│
└── README.md            # Este archivo
```

## 🚀 Backend Java (Spring Boot)

### Tecnologías Utilizadas

- **JUnit 5**: Framework de pruebas unitarias
- **Mockito**: Framework de mocking para dependencias
- **Spring Boot Test**: Utilidades de prueba de Spring Boot
- **Spring Security Test**: Pruebas de seguridad
- **H2 Database**: Base de datos en memoria para pruebas

### Pruebas Implementadas

#### Servicios (`service/`)

1. **AuthServiceTest**
   - ✅ Registro de usuario exitoso
   - ✅ Registro con email duplicado
   - ✅ Registro de diferentes tipos de usuario (ADMIN, ORGANIZER, BUYER)
   - ✅ Login exitoso
   - ✅ Login con usuario no encontrado
   - ✅ Login con contraseña incorrecta
   - ✅ Login con usuario inactivo

2. **UserServiceTest**
   - ✅ Obtener usuario por ID
   - ✅ Obtener usuario no encontrado
   - ✅ Obtener todos los usuarios
   - ✅ Actualizar usuario
   - ✅ Actualizar organización de organizador
   - ✅ Actualizar usuario no encontrado
   - ✅ Eliminar usuario (soft delete)
   - ✅ Obtener estadísticas de usuarios

#### Controladores (`controller/`)

1. **AuthControllerTest**
   - ✅ Endpoint de registro
   - ✅ Endpoint de login
   - ✅ Obtener usuario actual autenticado
   - ✅ Endpoint de logout

2. **UserControllerTest**
   - ✅ Obtener usuario por ID
   - ✅ Obtener todos los usuarios (solo admin)
   - ✅ Actualizar perfil propio
   - ✅ Actualizar perfil de otro usuario (prohibido)
   - ✅ Actualizar usuario como admin
   - ✅ Eliminar usuario (solo admin)
   - ✅ Obtener estadísticas (solo admin)

#### Seguridad (`security/`)

1. **JwtTokenProviderTest**
   - ✅ Generación de token JWT
   - ✅ Extracción de ID de usuario del token
   - ✅ Extracción de email del token
   - ✅ Extracción de rol del token
   - ✅ Validación de token válido
   - ✅ Validación de token inválido
   - ✅ Validación de token vacío/nulo
   - ✅ Verificación de claims del token

### Ejecutar Pruebas Java

#### Prerequisitos

- **Java 17 o superior** - Requerido para compilar y ejecutar las pruebas
- **Maven 3.6 o superior** - Gestor de dependencias y construcción

#### Instalación de Prerequisitos

**En macOS (usando Homebrew):**
```bash
# Instalar Java 17
brew install openjdk@17

# Configurar JAVA_HOME (agregar a ~/.zshrc o ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Instalar Maven
brew install maven

# Verificar instalación
java -version
mvn --version
```

**En macOS (usando SDKMAN - recomendado):**
```bash
# Instalar SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Instalar Java 17
sdk install java 17.0.2-open

# Instalar Maven
sdk install maven

# Verificar instalación
java -version
mvn --version
```

**En Linux (Ubuntu/Debian):**
```bash
# Instalar Java 17
sudo apt update
sudo apt install openjdk-17-jdk maven

# Verificar instalación
java -version
mvn --version
```

**En Windows:**
1. Descargar Java 17 desde [Adoptium](https://adoptium.net/)
2. Descargar Maven desde [Apache Maven](https://maven.apache.org/download.cgi)
3. Configurar variables de entorno `JAVA_HOME` y `MAVEN_HOME`
4. Agregar `%JAVA_HOME%\bin` y `%MAVEN_HOME%\bin` al PATH

#### Comandos

```bash
# Navegar al directorio de pruebas Java
cd tests/java-backend

# Compilar el proyecto (primera vez)
mvn clean compile

# Ejecutar todas las pruebas
mvn test

# Ejecutar pruebas con salida detallada
mvn test -X

# Ejecutar pruebas con cobertura de código
mvn test jacoco:report

# Ejecutar una clase de prueba específica
mvn test -Dtest=AuthServiceTest

# Ejecutar un método de prueba específico
mvn test -Dtest=AuthServiceTest#testRegister_Success

# Ver reporte de cobertura (después de ejecutar pruebas)
# El reporte se genera en: target/site/jacoco/index.html
open target/site/jacoco/index.html  # macOS
# O navegar manualmente al archivo HTML
```

### Configuración

El archivo `pom.xml` está configurado para:
- Usar las clases del backend original (`../java-backend/src/main/java`)
- Ejecutar pruebas con Maven Surefire
- Generar reportes de cobertura con JaCoCo
- Usar H2 como base de datos en memoria para pruebas

## 🐍 Backend Python (FastAPI)

### Tecnologías Utilizadas

- **pytest**: Framework de pruebas unitarias
- **pytest-asyncio**: Soporte para funciones asíncronas
- **httpx**: Cliente HTTP para pruebas de API
- **SQLAlchemy**: ORM para base de datos
- **SQLite en memoria**: Base de datos para pruebas

### Pruebas Implementadas

#### Eventos (`test_events.py`)

- ✅ Crear evento exitoso
- ✅ Crear evento con campos faltantes
- ✅ Obtener evento por ID
- ✅ Obtener evento no encontrado
- ✅ Listar todos los eventos
- ✅ Actualizar evento
- ✅ Actualizar evento no encontrado
- ✅ Eliminar evento
- ✅ Eliminar evento no encontrado

#### Tickets (`test_tickets.py`)

- ✅ Crear tipo de ticket exitoso
- ✅ Crear tipo de ticket con campos faltantes
- ✅ Obtener tipo de ticket por ID
- ✅ Obtener tipo de ticket no encontrado
- ✅ Obtener tipos de ticket de un evento
- ✅ Obtener tipos de ticket de evento sin tickets

#### Órdenes (`test_orders.py`)

- ✅ Crear orden exitosa
- ✅ Obtener orden por ID
- ✅ Obtener orden no encontrada
- ✅ Listar todas las órdenes
- ✅ Listar órdenes vacías

#### Categorías (`test_categories.py`)

- ✅ Crear categoría exitosa
- ✅ Crear categoría con campos mínimos
- ✅ Obtener categoría por ID
- ✅ Obtener categoría no encontrada
- ✅ Listar todas las categorías
- ✅ Listar categorías vacías

#### Ubicaciones (`test_locations.py`)

- ✅ Crear ubicación exitosa
- ✅ Crear ubicación con campos faltantes
- ✅ Obtener ubicación por ID
- ✅ Obtener ubicación no encontrada
- ✅ Listar todas las ubicaciones
- ✅ Listar ubicaciones vacías

#### Usuarios (`test_users.py`)

- ✅ Crear usuario exitoso
- ✅ Crear usuario con email duplicado
- ✅ Crear usuario organizador
- ✅ Obtener usuario por ID
- ✅ Obtener usuario no encontrado
- ✅ Listar todos los usuarios
- ✅ Listar usuarios con paginación
- ✅ Actualizar usuario
- ✅ Actualizar usuario no encontrado
- ✅ Actualizar estado de usuario
- ✅ Eliminar usuario
- ✅ Eliminar usuario no encontrado

### Ejecutar Pruebas Python

#### Prerequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

#### Instalación de Dependencias

```bash
# Navegar al directorio de pruebas Python
cd tests/python-backend

# Crear entorno virtual (recomendado)
# En macOS/Linux (usar python3):
python3 -m venv venv
# En Windows:
# python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
# O si pip no funciona, usar:
# pip3 install -r requirements.txt

# NOTA: Si tienes Python 3.14 o superior y hay problemas con pydantic,
# instala las dependencias sin versiones fijas:
# pip install pytest pytest-asyncio httpx fastapi sqlalchemy pydantic
```

#### Comandos

```bash
# IMPORTANTE: Asegúrate de estar en el directorio de pruebas y tener el entorno virtual activado
cd tests/python-backend
source venv/bin/activate  # En macOS/Linux
# venv\Scripts\activate    # En Windows

# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas con salida detallada
pytest -v

# Ejecutar pruebas con salida muy detallada
pytest -vv

# Ejecutar un archivo de prueba específico
pytest test_events.py

# Ejecutar una prueba específica
pytest test_events.py::test_create_event_success

# Ejecutar pruebas con cobertura de código
pytest --cov=../../python-backend/app --cov-report=html

# Ver reporte de cobertura
# El reporte se genera en: htmlcov/index.html
```

**Nota**: El `conftest.py` configura automáticamente la base de datos de prueba (SQLite en memoria), por lo que no necesitas configurar variables de entorno manualmente.

### Configuración

Las pruebas utilizan:
- **SQLite en memoria**: Base de datos temporal para cada prueba
- **Fixtures de pytest**: Para crear datos de prueba reutilizables
- **TestClient de FastAPI**: Para simular peticiones HTTP
- **Override de dependencias**: Para inyectar la base de datos de prueba

## 📊 Cobertura de Código

### Java

Para generar reportes de cobertura con JaCoCo:

```bash
cd tests/java-backend
mvn test jacoco:report
```

El reporte HTML se genera en: `target/site/jacoco/index.html`

### Python

Para generar reportes de cobertura con pytest-cov:

```bash
cd tests/python-backend
pytest --cov=../../python-backend/app --cov-report=html
```

El reporte HTML se genera en: `htmlcov/index.html`

## 🧪 Estrategia de Pruebas

### Principios Aplicados

1. **Aislamiento**: Cada prueba es independiente y no depende de otras
2. **Mocking**: Se utilizan mocks para dependencias externas (bases de datos, servicios)
3. **Fixtures**: Datos de prueba reutilizables y consistentes
4. **Cobertura**: Pruebas para casos exitosos y de error
5. **Nomenclatura**: Nombres descriptivos que indican qué se está probando

### Tipos de Pruebas

- **Pruebas unitarias de servicios**: Lógica de negocio aislada
- **Pruebas de controladores**: Endpoints REST y respuestas HTTP
- **Pruebas de integración**: Interacción entre componentes
- **Pruebas de seguridad**: Autenticación y autorización

## 🔧 Solución de Problemas

### Java

**Error: No se encuentran las clases del backend**
- Asegúrate de que el backend Java esté compilado
- Verifica que la ruta relativa en `pom.xml` sea correcta

**Error: Base de datos no disponible**
- Las pruebas usan H2 en memoria, no debería haber problemas
- Verifica que la configuración de Spring Boot Test esté correcta

### Python

**Error: Módulo no encontrado**
- Verifica que el path en `conftest.py` apunte correctamente al backend
- Asegúrate de que todas las dependencias estén instaladas

**Error: Base de datos no se crea**
- Verifica que los modelos estén importados correctamente
- Asegúrate de que `Base.metadata.create_all()` se ejecute en los fixtures

## 📝 Notas Importantes

1. **No se modifican los backends originales**: Las pruebas están completamente separadas
2. **Bases de datos de prueba**: Se usan bases de datos en memoria (H2 para Java, SQLite para Python)
3. **Datos de prueba**: Cada prueba crea sus propios datos y los limpia al finalizar
4. **Autenticación**: Las pruebas de Python asumen que la autenticación está deshabilitada o mockeada

## 🤝 Contribuir

Al agregar nuevas funcionalidades a los backends:

1. **Java**: Agregar pruebas correspondientes en `tests/java-backend/src/test/java/`
2. **Python**: Agregar pruebas correspondientes en `tests/python-backend/`
3. Mantener la cobertura de código por encima del 80%
4. Seguir las convenciones de nomenclatura existentes

## 📚 Recursos Adicionales

- [Documentación de JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Documentación de Mockito](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Documentación de pytest](https://docs.pytest.org/)
- [Documentación de FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

**Última actualización**: Diciembre 2024

