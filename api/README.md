# API REST - Jardín Botánico

API REST para el sistema de gestión de jardín botánico. Esta API proporciona endpoints para autenticación, gestión de plantas y solicitudes de donación.

## Requisitos

- Node.js v16 o superior
- SQLite 3 (se instala automáticamente como dependencia)

## Instalación

```bash
cd api
npm install
```

## Configuración

Crear archivo `.env` en la carpeta `api/` con las siguientes variables:

```env
PORT=3001
DB_PATH=./database.sqlite
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
NODE_ENV=development
```

**Nota**: La base de datos SQLite se creará automáticamente al iniciar el servidor si no existe.

## Iniciar el servidor

```bash
npm start
```

El servidor estará corriendo en `http://localhost:3001` (o el puerto configurado en `.env`)

## Endpoints de la API

### Autenticación

#### Registro de usuario
```
POST /api/auth/registro
Content-Type: application/json

{
  "usuario": "nombreusuario",
  "nombre": "Nombre Completo",
  "mail": "correo@ejemplo.com",
  "password": "contraseña123",
  "tipo": 0  // 0 = usuario normal, 1 = admin (opcional, default: 0)
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id": 1,
    "usuario": "nombreusuario",
    "mail": "correo@ejemplo.com",
    "tipo": 0
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "usuario": "nombreusuario",  // o correo electrónico
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Login exitoso",
  "usuario": {
    "usuario": "nombreusuario",
    "nombre": "Nombre Completo",
    "mail": "correo@ejemplo.com",
    "tipo": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**El token debe incluirse en las peticiones autenticadas:**
```
Authorization: Bearer <token>
```

---

### Plantas

#### Obtener todas las plantas
```
GET /api/plantas
```

**Respuesta (200):**
```json
{
  "total": 25,
  "plantas": [
    {
      "id": 1,
      "nombre": "Sábila",
      "nombre_cientifico": "Aloe vera",
      "descripcion": "Planta suculenta con propiedades medicinales",
      "propiedades": "Cicatrizante, hidratante, antiinflamatoria",
      "zona_geografica": "Regiones áridas y semiáridas",
      "usos": "Cosmética, medicina, alimentación",
      "imagen": "sabila.jpeg"
    }
  ]
}
```

#### Obtener una planta por ID
```
GET /api/plantas/:id
```

**Respuesta (200):**
```json
{
  "id": 1,
  "nombre": "Sábila",
  "nombre_cientifico": "Aloe vera",
  "descripcion": "...",
  "propiedades": "...",
  "zona_geografica": "...",
  "usos": "...",
  "imagen": "sabila.jpeg"
}
```

#### Crear nueva planta (requiere autenticación y permisos de admin)
```
POST /api/plantas
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- nombre: "Nombre de la planta" (requerido)
- nombre_cientifico: "Nombre científico"
- descripcion: "Descripción de la planta" (requerido)
- propiedades: "Propiedades medicinales"
- zona_geografica: "Zona geográfica"
- usos: "Usos de la planta"
- imagen: <archivo de imagen> (opcional)
```

**Respuesta (201):**
```json
{
  "mensaje": "Planta creada correctamente",
  "planta": {
    "id": 26,
    "nombre": "Nombre de la planta",
    "...": "..."
  }
}
```

#### Actualizar planta (requiere autenticación y permisos de admin)
```
PUT /api/plantas/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: (mismos campos que crear)
```

#### Eliminar planta (requiere autenticación y permisos de admin)
```
DELETE /api/plantas/:id
Authorization: Bearer <token>
```

---

### Solicitudes de Donación

#### Obtener solicitudes
```
GET /api/solicitudes
Authorization: Bearer <token>
```

- **Admin**: Ve todas las solicitudes
- **Usuario normal**: Solo ve sus propias solicitudes

**Respuesta (200):**
```json
{
  "total": 5,
  "solicitudes": [
    {
      "id": 1,
      "usuario": "nombreusuario",
      "nombre_planta": "Rosa del desierto",
      "descripcion_planta": "Planta pequeña con flores rosas",
      "propiedades_medicinales": "Ninguna conocida",
      "ubicacion": "Jardín de mi casa",
      "motivo_donacion": "Tengo muchas y quiero compartir",
      "fecha_solicitud": "2025-11-01 16:30:00",
      "estatus": "Pendiente"
    }
  ]
}
```

#### Obtener una solicitud por ID
```
GET /api/solicitudes/:id
Authorization: Bearer <token>
```

#### Crear nueva solicitud
```
POST /api/solicitudes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_planta": "Rosa del desierto",
  "descripcion_planta": "Planta pequeña con flores rosas",
  "propiedades_medicinales": "Ninguna conocida",
  "ubicacion": "Jardín de mi casa",
  "motivo_donacion": "Tengo muchas y quiero compartir"
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Solicitud creada correctamente",
  "solicitud": {
    "id": 6,
    "usuario": "nombreusuario",
    "nombre_planta": "Rosa del desierto",
    "...": "...",
    "estatus": "Pendiente"
  }
}
```

#### Actualizar estatus de solicitud (solo admin)
```
PUT /api/solicitudes/:id/estatus
Authorization: Bearer <token>
Content-Type: application/json

{
  "estatus": "Aprobada",  // Pendiente | Aprobada | Rechazada | En proceso
  "comentarios": "Comentarios del administrador (opcional)"
}
```

#### Eliminar solicitud
```
DELETE /api/solicitudes/:id
Authorization: Bearer <token>
```

- Solo el **dueño de la solicitud** o un **admin** pueden eliminar

---

## Códigos de estado HTTP

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en los datos enviados
- `401 Unauthorized`: No autorizado (token inválido o expirado)
- `403 Forbidden`: No tienes permisos para esta acción
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Manejo de imágenes

Las imágenes de plantas se guardan en `recursos/imagenes/` y se sirven en:
```
http://localhost:3000/recursos/imagenes/<nombre_imagen>
```

## Seguridad

- Las contraseñas se hashean con bcrypt
- Se usa JWT para autenticación
- Los tokens expiran en 24 horas
- CORS habilitado para peticiones desde cualquier origen
- Validación de tipos de archivo para imágenes

## Ejemplo de uso con JavaScript (App Móvil)

### Login y guardar token
```javascript
async function login(usuario, password) {
  const response = await fetch('http://tu-servidor:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Guardar token para uso posterior
    const token = data.token;
    localStorage.setItem('token', token);
    return data;
  } else {
    throw new Error(data.error);
  }
}
```

### Obtener plantas
```javascript
async function obtenerPlantas() {
  const response = await fetch('http://tu-servidor:3000/api/plantas');
  const data = await response.json();
  return data.plantas;
}
```

### Crear solicitud (requiere autenticación)
```javascript
async function crearSolicitud(solicitud) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://tu-servidor:3000/api/solicitudes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(solicitud)
  });

  const data = await response.json();
  return data;
}
```

## Notas importantes

1. **La base de datos SQLite se crea automáticamente** al iniciar el servidor
2. **No necesitas MySQL o XAMPP** - SQLite es un archivo local
3. Cambia `JWT_SECRET` en producción
4. El archivo `database.sqlite` se genera en la carpeta `api/` - inclúyelo en `.gitignore` si contiene datos sensibles

## Contacto

Para dudas sobre la API, consulta con el desarrollador del backend.
