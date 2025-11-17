# Cambios Realizados para Compatibilidad con Java 25

Este documento describe todos los cambios realizados para solucionar los problemas de compatibilidad con Java 25 en el proyecto `java-backend@Workshop-3`.

## Resumen

Se resolvieron problemas de compatibilidad entre:
- **Lombok** y Java 25
- **Mockito** y Java 25
- **Validación de contraseñas** en los tests

## Cambios Realizados

### 1. Actualización de Lombok

#### Problema
Lombok 1.18.30 no era compatible con Java 25, causando errores de compilación donde no se generaban los métodos getter/setter/builder.

#### Solución
Se actualizó Lombok a la versión `edge-SNAPSHOT` que incluye soporte para Java 25.

#### Archivos Modificados

**`Workshop-3/java-backend/pom.xml`**:
```xml
<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>edge-SNAPSHOT</version>
    <scope>provided</scope>
</dependency>

<!-- Repositorio para edge releases -->
<repositories>
    <repository>
        <id>projectlombok.org</id>
        <url>https://projectlombok.org/edge-releases</url>
    </repository>
</repositories>

<!-- Configuración del compilador -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>17</source>
        <target>17</target>
        <parameters>true</parameters>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>edge-SNAPSHOT</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

**`Workshop-3/tests/java-backend/pom.xml`**:
```xml
<properties>
    <lombok.version>edge-SNAPSHOT</lombok.version>
</properties>

<!-- Dependencia de Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
    <scope>provided</scope>
</dependency>

<!-- Repositorio para edge releases -->
<repositories>
    <repository>
        <id>projectlombok.org</id>
        <url>https://projectlombok.org/edge-releases</url>
    </repository>
</repositories>

<!-- Configuración del compilador -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>17</source>
        <target>17</target>
        <parameters>true</parameters>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

**`Workshop-3/java-backend/src/main/java/com/eventplatform/model/User.java`**:
- Se cambió de `@Data` a `@Getter` y `@Setter` explícitos para mejor compatibilidad con clases abstractas.

### 2. Actualización de Mockito y ByteBuddy

#### Problema
Mockito 5.x (versión incluida en Spring Boot 3.2.0) no podía crear mocks con Java 25 debido a restricciones de acceso a módulos internos.

#### Solución
Se actualizó Mockito a la versión 5.14.2 y ByteBuddy a 1.15.11, y se configuró el modo experimental de ByteBuddy junto con argumentos JVM para permitir acceso a módulos internos.

#### Archivos Modificados

**`Workshop-3/tests/java-backend/pom.xml`**:
```xml
<!-- Mockito actualizado -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.14.2</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.14.2</version>
    <scope>test</scope>
</dependency>

<!-- ByteBuddy actualizado -->
<dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-buddy</artifactId>
    <version>1.15.11</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-buddy-agent</artifactId>
    <version>1.15.11</version>
    <scope>test</scope>
</dependency>

<!-- Configuración de Surefire para Java 25 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <argLine>
            -Dnet.bytebuddy.experimental=true
            --add-opens=java.base/java.lang=ALL-UNNAMED
            --add-opens=java.base/java.lang.reflect=ALL-UNNAMED
            --add-opens=java.base/java.util=ALL-UNNAMED
            --add-opens=java.base/java.lang.invoke=ALL-UNNAMED
            --add-opens=java.base/java.io=ALL-UNNAMED
            --add-opens=java.base/java.nio=ALL-UNNAMED
        </argLine>
    </configuration>
</plugin>
```

**`Workshop-3/tests/java-backend/src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`**:
- Se creó este archivo para configurar Mockito en modo inline:
```
mock-maker-inline
```

### 3. Corrección de Tests - Validación de Contraseñas

#### Problema
Los tests usaban la contraseña `"Test123!@#"` que contenía el carácter `#`, el cual no está permitido en el patrón de validación del `RegisterRequest`. El patrón solo permite: `@$!%*?&`.

#### Solución
Se cambió la contraseña en todos los tests de `"Test123!@#"` a `"Test123!@"`.

#### Archivos Modificados

**`Workshop-3/tests/java-backend/src/test/java/com/eventplatform/controller/AuthControllerTest.java`**:
```java
// Antes:
registerRequest.setPassword("Test123!@#");
loginRequest.setPassword("Test123!@#");

// Después:
registerRequest.setPassword("Test123!@");
loginRequest.setPassword("Test123!@");
```

**`Workshop-3/tests/java-backend/src/test/java/com/eventplatform/service/AuthServiceTest.java`**:
```java
// Antes:
registerRequest.setPassword("Test123!@#");
loginRequest.setPassword("Test123!@#");

// Después:
registerRequest.setPassword("Test123!@");
loginRequest.setPassword("Test123!@");
```

## Resultados

### Antes de los Cambios
- ❌ 63 errores de compilación (métodos de Lombok no generados)
- ❌ 22 errores en tests (Mockito no compatible con Java 25)
- ❌ 1 fallo en test (validación de contraseña)

### Después de los Cambios
- ✅ Compilación exitosa
- ✅ 42 tests pasan (0 fallos, 0 errores)
- ✅ Compatibilidad completa con Java 25

## Comandos para Verificar

```bash
# Compilar el proyecto
cd Workshop-3/java-backend
mvn clean compile

# Ejecutar las pruebas
cd ../tests/java-backend
mvn clean test
```

## Notas Importantes

1. **Lombok Edge Version**: Se está usando la versión `edge-SNAPSHOT` de Lombok que es compatible con Java 25. Esta es una versión de desarrollo, pero es necesaria para la compatibilidad.

2. **ByteBuddy Experimental Mode**: Se activó el modo experimental de ByteBuddy (`-Dnet.bytebuddy.experimental=true`) para permitir que Mockito funcione con Java 25.

3. **Argumentos JVM**: Los argumentos `--add-opens` son necesarios para permitir que ByteBuddy acceda a los módulos internos de Java, lo cual es requerido por Mockito para crear mocks.

4. **Validación de Contraseñas**: El patrón de validación en `RegisterRequest` solo permite los siguientes caracteres especiales: `@$!%*?&`. Cualquier otro carácter especial (como `#`) causará que la validación falle.

## Referencias

- [Lombok Edge Releases](https://projectlombok.org/edge-releases)
- [Mockito Compatibility](https://github.com/mockito/mockito)
- [ByteBuddy Documentation](https://bytebuddy.net/)
- [Java 25 Release Notes](https://openjdk.org/projects/jdk/25/)

## Fecha de Cambios

**Fecha**: 8 de noviembre de 2025  
**Java Version**: 25.0.1  
**Spring Boot Version**: 3.2.0

