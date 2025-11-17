# Instalación de Java y Maven para Pruebas

Este documento explica cómo instalar Java 17 y Maven en macOS para ejecutar las pruebas del backend Java.

## Opción 1: Usando Homebrew (Recomendado)

### Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Instalar Java 17 y Maven

```bash
# Instalar Java 17
brew install openjdk@17

# Configurar JAVA_HOME
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Instalar Maven
brew install maven

# Verificar instalación
java -version
mvn --version
```

## Opción 2: Usando SDKMAN (Alternativa)

### Instalar SDKMAN

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

### Instalar Java 17 y Maven

```bash
# Instalar Java 17
sdk install java 17.0.2-open

# Instalar Maven
sdk install maven

# Verificar instalación
java -version
mvn --version
```

## Opción 3: Descarga Manual

### Instalar Java 17

1. Descargar Java 17 desde [Adoptium](https://adoptium.net/temurin/releases/?version=17)
2. Instalar el paquete `.pkg` descargado
3. Configurar JAVA_HOME:
   ```bash
   echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
   echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

### Instalar Maven

1. Descargar Maven desde [Apache Maven](https://maven.apache.org/download.cgi)
2. Extraer el archivo a `/usr/local/` o `~/Applications/`
3. Configurar MAVEN_HOME:
   ```bash
   echo 'export MAVEN_HOME=/usr/local/apache-maven-3.9.x' >> ~/.zshrc
   echo 'export PATH="$MAVEN_HOME/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Verificar Instalación

Después de instalar, verifica que todo funciona:

```bash
# Verificar Java
java -version
# Debe mostrar: openjdk version "17.x.x"

# Verificar Maven
mvn --version
# Debe mostrar: Apache Maven 3.x.x

# Verificar JAVA_HOME
echo $JAVA_HOME
# Debe mostrar una ruta como: /Library/Java/JavaVirtualMachines/...
```

## Ejecutar Pruebas

Una vez instalado Java y Maven:

```bash
cd Workshop-3/tests/java-backend
mvn clean test
```

## Solución de Problemas

### Java no se encuentra

```bash
# Verificar instalaciones de Java disponibles
/usr/libexec/java_home -V

# Configurar JAVA_HOME manualmente
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

### Maven no se encuentra

```bash
# Verificar si Maven está instalado
which mvn

# Si no está, reinstalar con Homebrew
brew install maven
```

### Error de compilación

```bash
# Limpiar y recompilar
mvn clean compile

# Si persiste, verificar que Java 17 está configurado
java -version
```

