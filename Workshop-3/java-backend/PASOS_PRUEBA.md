# ⚡ PASOS FINALES PARA PROBAR EL BACKEND

## 📍 Estás aquí:
✅ Maven instalado
✅ MySQL Server instalado
✅ En la carpeta del proyecto

---

## 🔧 PASO 1: Crear la Base de Datos

### El script `setup-database.ps1` está corriendo y te preguntará:

```
Usuario (por defecto: root): [Presiona Enter]
Contraseña: [Escribe tu contraseña de MySQL]
```

**⚠️ Importante:** Usa la contraseña que configuraste cuando instalaste MySQL.

---

## 📝 PASO 2: Actualizar application.properties

Abre el archivo:
```
src\main\resources\application.properties
```

**Busca la línea 12:**
```properties
spring.datasource.password=root
```

**Cámbiala a tu contraseña de MySQL:**
```properties
spring.datasource.password=TU_CONTRASEÑA_AQUI
```

**Ejemplo:** Si tu contraseña es `admin123`, escribe:
```properties
spring.datasource.password=admin123
```

**Guarda el archivo** (Ctrl+S)

---

## 🚀 PASO 3: Compilar y Ejecutar

### Opción A - Script Automático (Recomendado):
```powershell
.\test-backend.ps1
```

### Opción B - Comandos Manuales:
```powershell
# Compilar (tarda 2-3 minutos la primera vez)
mvn clean install

# Ejecutar
mvn spring-boot:run
```

---

## ✅ PASO 4: Verificar que Funciona

### Busca este mensaje en la consola:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

...

Started EventPlatformApplication in 6.123 seconds
```

### 🎉 Si ves "Started EventPlatformApplication" ¡FUNCIONA!

---

## 🧪 PASO 5: Probar en Swagger

### Abre tu navegador en:
```
http://localhost:8080/swagger-ui.html
```

### Prueba el registro:
1. Expande `POST /api/auth/register`
2. Click "Try it out"
3. Usa este JSON:
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "Test@123456",
  "userType": "BUYER"
}
```
4. Click "Execute"
5. Deberías ver un token JWT en la respuesta

### Prueba el login:
1. Expande `POST /api/auth/login`
2. Click "Try it out"
3. Usa:
```json
{
  "email": "test@test.com",
  "password": "Test@123456"
}
```
4. Click "Execute"
5. Copia el token

### Usa el token:
1. Click en "Authorize" 🔓 (arriba)
2. Pega: `Bearer TU_TOKEN`
3. Click "Authorize"
4. Prueba `GET /api/auth/me`

---

## 🐛 Si algo falla:

### Error de conexión a BD:
- Verifica que MySQL esté corriendo
- Verifica la contraseña en `application.properties`

### Error de compilación:
- Asegúrate de tener Java 17: `java -version`

### Puerto 8080 ocupado:
- Cambia en `application.properties`: `server.port=8081`

---

## 📞 ¿Necesitas ayuda?
- Lee los mensajes de error completos
- Verifica que completaste los pasos 1 y 2
- La primera compilación tarda más (descarga dependencias)

---

**¡Éxito!** 🎉
