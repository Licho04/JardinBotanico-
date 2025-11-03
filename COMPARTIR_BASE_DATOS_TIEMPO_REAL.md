# 🔄 Compartir Base de Datos en Tiempo Real

Para que **ambos** (tú y tu compañero) vean los mismos datos en tiempo real:

- ✅ Tu compañero agrega una planta desde su app móvil → Tú la ves en tu sitio web PHP
- ✅ Tú agregas una planta desde tu sitio web PHP → Tu compañero la ve en su app móvil
- ✅ Mismos usuarios, mismas solicitudes, misma información

---

## 📋 Requisitos

1. **API desplegada en un servidor compartido** (servidor de la universidad)
2. **Base de datos SQLite en el servidor** (única para ambos)
3. **Tu sitio PHP apunta a la API del servidor** (no localhost)
4. **App móvil de tu compañero apunta a la API del servidor**

---

## 🚀 Paso 1: Desplegar API en Servidor Compartido

Sigue la guía `DEPLOY_API_SERVIDOR.md` para:
- Subir la API al servidor de la universidad
- Configurar PM2 para que siempre esté corriendo
- Obtener la URL pública de la API

**Ejemplo de URL:**
```
http://servidor-universidad.edu.mx:3001/api
# o
https://api-jardin.universidad.edu.mx/api
```

**IMPORTANTE:** La base de datos `database.sqlite` debe estar en el servidor, no localmente.

---

## ⚙️ Paso 2: Configurar tu Sitio PHP para Usar la API del Servidor

### Archivo: `configuracion/conexion.php`

Actualiza la URL de la API para que apunte al servidor:

```php
<?php
// Configurar zona horaria para México
date_default_timezone_set('America/Mexico_City');

// CONFIGURACIÓN: Elegir entre conexión directa a BD o API
define('USAR_API', true); // true = usar API, false = usar conexión directa

if (USAR_API) {
    // ===== MODO API (Node.js) =====
    require_once __DIR__ . '/api_client.php';
    
    // 🔴 CAMBIAR ESTA URL por la del servidor compartido
    $apiUrl = 'http://servidor-universidad.edu.mx:3001/api';
    // o si tienen dominio:
    // $apiUrl = 'https://api-jardin.universidad.edu.mx/api';
    
    // Crear instancia del cliente API
    $api = new ApiClient($apiUrl);
    
    // Variable $conexion se mantiene para compatibilidad
    $conexion = $api;
    
} else {
    // Modo conexión directa (no usar en producción compartida)
    // ...
}
?>
```

**Cambios necesarios:**
- Cambiar `http://localhost:3001/api` por la URL del servidor
- Asegurar que `USAR_API = true`

---

## 🔧 Paso 3: Configurar Entornos (Opcional pero Recomendado)

Para trabajar localmente y en producción sin cambiar código manualmente:

### Crear archivo: `configuracion/config_api.php`

```php
<?php
/**
 * Configuración de la API según el entorno
 */

// Detectar si estamos en desarrollo local o en servidor
$esLocal = (
    $_SERVER['HTTP_HOST'] === 'localhost' ||
    $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
    strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0
);

if ($esLocal) {
    // Desarrollo local
    define('API_URL', 'http://localhost:3001/api');
} else {
    // Producción (servidor compartido)
    define('API_URL', 'http://servidor-universidad.edu.mx:3001/api');
    // o
    // define('API_URL', 'https://api-jardin.universidad.edu.mx/api');
}
?>
```

### Actualizar `configuracion/conexion.php`

```php
<?php
date_default_timezone_set('America/Mexico_City');

define('USAR_API', true);

if (USAR_API) {
    require_once __DIR__ . '/api_client.php';
    require_once __DIR__ . '/config_api.php'; // Cargar configuración
    
    // Usar la URL según el entorno
    $apiUrl = API_URL;
    
    $api = new ApiClient($apiUrl);
    $conexion = $api;
    
} else {
    // ...
}
?>
```

**Ventajas:**
- ✅ Funciona automáticamente en local y producción
- ✅ No necesitas cambiar código manualmente
- ✅ Más fácil de mantener

---

## 📱 Paso 4: Compartir URL con tu Compañero

Tu compañero debe usar la **misma URL de la API** en su app móvil:

```javascript
// En la app móvil de tu compañero
const API_URL = 'http://servidor-universidad.edu.mx:3001/api';
```

---

## 🗄️ Paso 5: Base de Datos Compartida

### Ubicación de la Base de Datos

La base de datos `database.sqlite` debe estar en el servidor:

```
/ruta/del/servidor/api-jardin-botanico/database.sqlite
```

### Permisos

Asegurar que el servidor tenga permisos de lectura/escritura:

```bash
# En el servidor
chmod 644 database.sqlite
chmod 755 api/
```

### Inicializar Base de Datos

La base de datos se crea automáticamente al iniciar la API la primera vez.

Si necesitas datos iniciales:
1. Crear `database.sqlite` localmente con datos
2. Subirla al servidor (solo una vez)
3. O usar la API para crear datos iniciales

---

## ✅ Verificación

### 1. Verificar que tu PHP usa la API del servidor

Abre tu sitio web y verifica en el navegador (F12 → Network):
- Las peticiones van a `servidor-universidad.edu.mx:3001`
- No van a `localhost:3001`

### 2. Probar sincronización

**Prueba 1: Tu compañero agrega una planta**
1. Tu compañero hace login en su app móvil
2. Crea una nueva planta
3. Recarga tu sitio web PHP
4. ✅ Debes ver la nueva planta

**Prueba 2: Tú agregas una planta**
1. Haces login en tu sitio web PHP (como admin)
2. Creas una nueva planta
3. Tu compañero recarga su app móvil
4. ✅ Tu compañero debe ver la nueva planta

**Prueba 3: Verificar que es la misma base de datos**
1. Tu compañero hace login → obtiene un token
2. Crea una solicitud de donación
3. Tú haces login como admin en tu sitio web
4. ✅ Debes ver la solicitud de tu compañero

---

## 🔄 Flujo de Sincronización

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Tu Sitio PHP   │────────▶│              │◀────────│  App Móvil       │
│  (Frontend)     │  HTTP   │  API Node.js │  HTTP   │  (Compañero)     │
└─────────────────┘         │  (Servidor)  │         └─────────────────┘
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ database.sqlite │
                            │  (Compartida)   │
                            └────────────────┘
```

**Todos los cambios van a la misma base de datos → Todos ven los mismos datos**

---

## ⚠️ Consideraciones Importantes

### 1. Autenticación

- Los tokens JWT funcionan para ambos
- Si tu compañero hace login, el token es válido para tu sitio PHP
- Si tú haces login, el token es válido para la app móvil

### 2. Roles y Permisos

- Admin: Puede crear/editar/eliminar plantas (desde PHP o móvil)
- Usuario: Solo puede crear solicitudes (desde PHP o móvil)

### 3. Imágenes

Las imágenes se guardan en el servidor:
```
/ruta/del/servidor/recursos/imagenes/nombre_imagen.jpeg
```

**Asegurar que la ruta esté correcta en la API:**
- Revisar `api/src/server.js` → ruta de archivos estáticos
- Las imágenes deben ser accesibles desde ambas aplicaciones

### 4. Sesiones PHP

- Cada uno tiene su propia sesión PHP (en su propio navegador/servidor)
- La autenticación se maneja con tokens JWT (compartidos)

---

## 🐛 Solución de Problemas

### Problema: No veo los cambios de mi compañero

**Solución:**
1. Verificar que tu PHP apunta a la API del servidor (no localhost)
2. Verificar que la API del servidor está corriendo
3. Recargar la página (F5)
4. Revisar la consola del navegador (F12) para errores

### Problema: Error de conexión a la API

**Solución:**
1. Verificar que la URL de la API es correcta
2. Verificar que el servidor permite conexiones desde tu IP
3. Probar la URL directamente en el navegador: `http://servidor-universidad.edu.mx:3001/api/plantas`

### Problema: No puedo hacer login

**Solución:**
1. Verificar que la API del servidor tiene usuarios en la base de datos
2. Verificar que el endpoint de login funciona: `POST /api/auth/login`
3. Revisar los logs de la API en el servidor

### Problema: Las imágenes no se ven

**Solución:**
1. Verificar que las imágenes están en la ruta correcta del servidor
2. Verificar que la API sirve los archivos estáticos correctamente
3. Probar la URL de imagen directamente: `http://servidor-universidad.edu.mx:3001/recursos/imagenes/nombre.jpg`

---

## 📋 Checklist Final

- [ ] API desplegada en servidor compartido
- [ ] Base de datos `database.sqlite` en el servidor
- [ ] `configuracion/conexion.php` apunta a la API del servidor (no localhost)
- [ ] Tu compañero tiene la URL de la API del servidor
- [ ] Probado: Tu compañero agrega algo → Tú lo ves
- [ ] Probado: Tú agregas algo → Tu compañero lo ve
- [ ] Permisos de base de datos correctos
- [ ] Imágenes accesibles desde ambos

---

## 💡 Resumen

**Para compartir datos en tiempo real:**

1. ✅ **API única** en servidor compartido
2. ✅ **Base de datos única** (`database.sqlite` en el servidor)
3. ✅ **Tu PHP** → apunta a la API del servidor
4. ✅ **App móvil** → apunta a la API del servidor

**Resultado:** Ambos ven y modifican los mismos datos en tiempo real ✨

