# Instrucciones para Restaurar el Backup de Eventos

El archivo `Backup_Events.sql` es un dump binario de PostgreSQL creado con `pg_dump` en formato custom.

## 🔧 Métodos para Restaurar el Backup

### Método 1: Script Batch (Más Fácil)

**Desde CMD o PowerShell:**

```powershell
cd Workshop-3/python-backend
.\ejecutar-backup-con-password.bat
```

Este script te pedirá la contraseña de PostgreSQL. Usa la contraseña por defecto: `200127`

### Método 2: Script PowerShell (Recomendado)

**Desde PowerShell:**

```powershell
cd Workshop-3/python-backend
.\ejecutar-backup.ps1
```

Este script te preguntará si tu contraseña es diferente y la manejará de forma segura.

### Método 3: Comando Manual

**Desde CMD o PowerShell:**

```cmd
cd Workshop-3/python-backend
set PGPASSWORD=200127
pg_restore -U postgres -h localhost -p 5432 -d eventplatform --clean --if-exists -v Backup\Backup_Events.sql
```

**O si tu contraseña es diferente:**

```cmd
cd Workshop-3/python-backend
pg_restore -U postgres -h localhost -p 5432 -d eventplatform --clean --if-exists -v Backup\Backup_Events.sql
```

(Te pedirá la contraseña interactivamente)

### Método 4: Usando Archivo .pgpass (Más Seguro)

1. **Crear archivo `.pgpass` en tu directorio home:**

   **Windows (PowerShell):**
   ```powershell
   $pgpassPath = "$env:USERPROFILE\.pgpass"
   "localhost:5432:eventplatform:postgres:200127" | Out-File -FilePath $pgpassPath -Encoding ASCII
   icacls $pgpassPath /inheritance:r
   icacls $pgpassPath /grant "$env:USERNAME:R"
   ```

   **Windows (CMD):**
   ```cmd
   echo localhost:5432:eventplatform:postgres:200127 > %USERPROFILE%\.pgpass
   ```

2. **Ejecutar el restore:**
   ```cmd
   cd Workshop-3/python-backend
   pg_restore -U postgres -h localhost -p 5432 -d eventplatform --clean --if-exists -v Backup\Backup_Events.sql
   ```

## ⚙️ Parámetros del Comando

- `-U postgres`: Usuario de PostgreSQL
- `-h localhost`: Host de PostgreSQL
- `-p 5432`: Puerto de PostgreSQL
- `-d eventplatform`: Nombre de la base de datos
- `--clean`: Limpia objetos antes de crearlos
- `--if-exists`: No falla si el objeto no existe
- `-v`: Modo verbose (muestra el progreso)

## 🔍 Verificar que Funcionó

Después de ejecutar el backup, verifica que los datos se restauraron:

```sql
psql -U postgres -d eventplatform -c "SELECT COUNT(*) FROM events;"
psql -U postgres -d eventplatform -c "SELECT COUNT(*) FROM orders;"
psql -U postgres -d eventplatform -c "SELECT COUNT(*) FROM tickets;"
```

## ⚠️ Solución de Problemas

### Error: "password authentication failed"

- Verifica que la contraseña sea correcta
- Por defecto es: `200127`
- Si es diferente, edita `app/core/config.py` o usa el script interactivo

### Error: "database does not exist"

Primero crea la base de datos:

```sql
psql -U postgres -c "CREATE DATABASE eventplatform;"
```

O ejecuta los scripts de inicialización:

```cmd
cd Workshop-3/python-backend/scripts
psql -U postgres -f 01-create-database.sql
psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
```

### Error: "connection to server failed"

- Verifica que PostgreSQL esté corriendo
- Verifica que el puerto sea 5432
- Verifica que el host sea localhost

### Error: "permission denied"

- Asegúrate de que el usuario `postgres` tenga permisos en la base de datos
- O usa un usuario con permisos de superusuario

## 📝 Notas

- El backup es un dump binario (formato custom de pg_dump)
- Se usa `pg_restore` en lugar de `psql` para restaurarlo
- El flag `--clean` elimina objetos existentes antes de restaurarlos
- El flag `--if-exists` evita errores si los objetos no existen

## ✅ Checklist

Antes de ejecutar el backup:

- [ ] PostgreSQL está corriendo
- [ ] La base de datos `eventplatform` existe
- [ ] Tienes las credenciales correctas (usuario: postgres, password: 200127)
- [ ] El archivo `Backup_Events.sql` existe en `Backup/`

Después de ejecutar:

- [ ] No hay errores en la salida
- [ ] Puedes verificar que los datos se restauraron
- [ ] La aplicación puede conectarse a la base de datos

