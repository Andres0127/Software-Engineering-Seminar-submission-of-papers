# Configuración de Puertos - Workshop-3

## Puertos Configurados

Los siguientes puertos están configurados para los servicios del proyecto:

| Servicio | Puerto Interno | Puerto Externo (Host) | URL de Acceso |
|----------|---------------|----------------------|---------------|
| MySQL (Java Backend) | 3306 | **3307** | `localhost:3307` |
| PostgreSQL (Python Backend) | 5432 | **5433** | `localhost:5433` |
| Java Backend API | 8081 | 8081 | `http://localhost:8081` |
| Python Backend API | 8000 | 8000 | `http://localhost:8000` |
| React Frontend | 80 | 3000 | `http://localhost:3000` |

## Nota Importante

Los puertos externos de MySQL y PostgreSQL fueron cambiados para evitar conflictos con servicios locales:

- **MySQL**: Cambiado de 3306 a **3307** (puerto externo)
- **PostgreSQL**: Cambiado de 5432 a **5433** (puerto externo)

### ¿Por qué?

Si tienes MySQL o PostgreSQL instalados localmente en tu máquina, estos servicios usan los puertos 3306 y 5432 respectivamente. Al cambiar los puertos externos, Docker puede usar estos puertos internamente mientras que desde tu máquina accedes por los nuevos puertos.

**Importante**: Los contenedores dentro de Docker se siguen comunicando entre sí usando los puertos internos (3306 y 5432), solo el acceso desde tu máquina local usa los puertos externos (3307 y 5433).

## Conexión desde Herramientas Externas

Si necesitas conectarte a las bases de datos desde herramientas externas (como MySQL Workbench, pgAdmin, DBeaver, etc.):

- **MySQL**: 
  - Host: `localhost`
  - Puerto: `3307`
  - Usuario: `app_user`
  - Contraseña: `AppStrongPass1!`
  - Base de datos: `eventplatform_auth`

- **PostgreSQL**:
  - Host: `localhost`
  - Puerto: `5433`
  - Usuario: `postgres`
  - Contraseña: `postgres`
  - Base de datos: `eventplatform`

## Restaurar Puertos Originales

Si quieres volver a los puertos originales (3306 y 5432), asegúrate de:

1. Detener cualquier servicio local de MySQL/PostgreSQL que esté usando esos puertos
2. Cambiar los puertos en `docker-compose.yml`:
   - MySQL: `"3306:3306"`
   - PostgreSQL: `"5432:5432"`

