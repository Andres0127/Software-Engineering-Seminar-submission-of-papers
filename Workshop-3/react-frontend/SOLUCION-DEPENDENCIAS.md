# Solución: Errores de Módulos No Encontrados

## Problema
El frontend muestra errores de módulos no encontrados:
- `date-fns`
- `chart.js`
- `react-chartjs-2`

## Solución

### Opción 1: Instalar dependencias manualmente

Ejecuta estos comandos desde la carpeta `Workshop-3/react-frontend`:

```bash
# Instalar todas las dependencias
npm install

# Si hay problemas con peer dependencies, usa:
npm install --legacy-peer-deps

# O instalar las específicas que faltan:
npm install date-fns chart.js react-chartjs-2 --save
```

### Opción 2: Usar el script creado

Ejecuta el archivo `instalar-dependencias.bat` que está en la carpeta del frontend.

### Opción 3: Eliminar node_modules y reinstalar

Si las dependencias siguen sin funcionar:

```bash
cd Workshop-3/react-frontend

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# O en Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstalar todo
npm install
```

## Verificar instalación

Después de instalar, verifica que las dependencias estén instaladas:

```bash
npm list date-fns chart.js react-chartjs-2
```

## Si el problema persiste

1. Verifica que estás usando la versión correcta de Node.js (debe ser 20+)
2. Asegúrate de que npm está actualizado: `npm install -g npm@latest`
3. Intenta limpiar la caché: `npm cache clean --force`

