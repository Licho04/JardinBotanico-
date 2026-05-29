# REQUERIMIENTOS TÉCNICOS DEL SISTEMA

## Sistema de Gestión del Jardín Botánico de Plantas Medicinales UJAT

**Versión:** 2.0  
**Fecha:** Mayo 2026  
**Desarrolladores:** Luis Enrique Madrigal Martínez · Angel Svein Ortiz Méndez

---

## 1. TECNOLOGÍAS UTILIZADAS

### 1.1 Backend

| Componente | Detalle |
|------------|---------|
| Lenguaje | JavaScript (Node.js) |
| Runtime recomendado | Node.js 18.x LTS |
| Framework | Express.js 4.18.x |
| Módulos | ES Modules (`"type": "module"`) |
| Punto de entrada | `app/src/server.js` |
| Puerto por defecto | `3001` (`PORT` en `.env`) |

### 1.2 Base de datos

| Componente | Detalle |
|------------|---------|
| Motor | SQLite 3.40+ |
| Driver | `sqlite3` v5.1.7 |
| Archivo local | `app/database.sqlite` |
| Producción (AWS EC2) | `DATA_PATH/database.sqlite` o ruta configurada en el servidor |
| ORM | No — consultas SQL nativas con promesas (`runAsync`, `allAsync`, `getAsync`) |
| Inicialización | `app/src/config/init-database.js` (al arrancar) |
| Foreign keys | `PRAGMA foreign_keys = ON` |

### 1.3 Autenticación y seguridad

| Paquete | Uso |
|---------|-----|
| `bcrypt` v5.1.1 | Hash de contraseñas (factor 10) |
| `jsonwebtoken` v9.0.2 | Tokens JWT (24 h) |
| `express-session` v1.18.x | Sesiones HTTP |
| `cookie-parser` v1.4.7 | Cookies |
| `express-validator` v7.0.1 | Validación de entradas |
| `cors` v2.8.5 | CORS habilitado |

### 1.4 Frontend

| Componente | Detalle |
|------------|---------|
| Arquitectura | **Desacoplada** — HTML/CSS/JS estático en `/frontend` |
| Comunicación | Fetch API → endpoints `/api/*` |
| Motor de plantillas | **No usado en producción** (`ejs` permanece en dependencias por legado) |
| Estilos | `frontend/recursos/estilos/styles.css` |
| Iconos | Font Awesome 6 (CDN) |
| Diseño | Responsive (media queries) |

### 1.5 Manejo de archivos

| Aspecto | Detalle |
|---------|---------|
| Librería | Multer v1.4.5 |
| Imágenes de plantas | JPEG, JPG, PNG, GIF, WEBP, AVIF |
| Tamaño máximo (plantas) | 15 MB |
| Tamaño máximo (errores Multer en servidor) | 5 MB (mensaje API) |
| Desarrollo | `frontend/recursos/imagenes/` |
| Producción (`DATA_PATH`) | `{DATA_PATH}/imagenes/` servido en `/recursos/imagenes` |
| Respaldos BD | `.sqlite` vía `/api/system/backup` y `/restore` |

### 1.6 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default `3001`) |
| `NODE_ENV` | `development` \| `production` |
| `JWT_SECRET` | Secreto para firmar JWT |
| `DB_PATH` | Ruta explícita a `database.sqlite` (opcional) |
| `DATA_PATH` | Directorio persistente en el servidor (p. ej. `/var/data` en EC2) |
| `FRONTEND_PATH` | Ruta al directorio `frontend` (opcional) |

Archivo: `app/.env` (no versionado).

---

## 2. REQUERIMIENTOS DE SOFTWARE

### 2.1 Sistema operativo

- **Linux:** Ubuntu 20.04/22.04 LTS, Debian 11+ (recomendado en servidor)
- **Desarrollo:** Windows 10+, macOS (cualquier SO con Node.js)

### 2.2 Software en el servidor

| Software | Versión |
|----------|---------|
| Node.js | 18.x LTS (mínimo 16.x) |
| npm | 8.x+ |
| Proxy inverso (opcional) | Nginx 1.18+ o Apache 2.4+ |
| Gestor de procesos (opcional) | PM2 5.x |
| SSL (producción) | Let's Encrypt / certificado institucional |

---

## 3. DEPENDENCIAS DEL PROYECTO

### 3.1 Producción (`app/package.json`)

```
express, sqlite3, bcrypt, jsonwebtoken, cookie-parser,
express-session, express-validator, multer, cors, dotenv, ejs
```

### 3.2 Scripts npm

| Comando | Acción |
|---------|--------|
| `npm start` | Inicia `src/server.js` |
| `npm run dev` | Inicia con `node --watch` |

### 3.3 Utilidades de mantenimiento

| Archivo | Propósito |
|---------|-----------|
| `app/src/scripts/hash-passwords.js` | Hashear contraseñas en texto plano |

---

## 4. CONFIGURACIÓN REQUERIDA

### 4.1 Ejemplo `app/.env` (desarrollo)

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=generar-secreto-aleatorio-largo
```

### 4.2 Producción (AWS EC2)

**Servidor actual:** instancia EC2 Linux/UNIX — IP pública `3.12.148.33`.

Ejemplo `app/.env` en el servidor:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=[secreto-unico-64-caracteres]
DATA_PATH=/var/data
```

Acceso habitual:

- Sitio: `http://3.12.148.33/plantas/`
- API: `http://3.12.148.33/plantas/api`

El frontend detecta producción por hostname distinto de `localhost` y usa `BASE_PATH=/plantas` y `API_URL=/plantas/api` (configurado en los HTML del frontend). En local sigue siendo `http://localhost:3001` con `/api` en la raíz.

Recomendaciones en EC2:

- Proceso gestionado con **PM2** o **systemd** para reinicio automático.
- **Nginx** (u otro proxy) delante de Node para HTTPS y archivos estáticos.
- Grupo de seguridad: abrir solo los puertos necesarios (p. ej. 80, 443, 22).
- Respaldos periódicos de `database.sqlite` y de `{DATA_PATH}/imagenes/`.

### 4.3 Permisos recomendados (Linux)

| Ruta | Permisos | Notas |
|------|----------|-------|
| `app/.env` | `600` | Solo propietario |
| `app/database.sqlite` | `664` | Lectura/escritura app |
| `frontend/recursos/imagenes/` | `775` | Uploads en desarrollo |
| `{DATA_PATH}/` | `775` | BD e imágenes en producción |

### 4.4 Puertos

| Puerto | Uso |
|--------|-----|
| 3001 (default) | Servidor Express |
| 80 / 443 | Proxy inverso (producción) |

---

## 5. ESTRUCTURA DEL PROYECTO

```
JardinBotanico/
├── app/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── init-database.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── plantas.controller.js
│   │   │   ├── solicitudes.controller.js   # Lógica sobre tabla donaciones
│   │   │   ├── remedios.controller.js
│   │   │   └── usos.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── plantas.routes.js
│   │   │   ├── solicitudes.routes.js
│   │   │   └── api/
│   │   │       ├── remedios.routes.js
│   │   │       ├── usos.routes.js
│   │   │       ├── usuarios.routes.js
│   │   │       └── system.routes.js
│   │   ├── scripts/
│   │   │   └── hash-passwords.js
│   │   └── server.js
│   ├── database.sqlite
│   ├── package.json
│   └── .env                    # Crear manualmente
├── frontend/
│   ├── index.html
│   ├── login.html, registro.html
│   ├── perfil.html, historia.html
│   ├── mis-solicitudes.html
│   ├── admin.html
│   ├── forms/                  # Fragmentos para modales admin
│   └── recursos/
│       ├── estilos/styles.css
│       └── imagenes/
├── README.md
├── REQUERIMIENTOS_TECNICOS.md
└── REQUERIMIENTOS_FUNCIONALES_V2.md
```

---

## 6. ESQUEMA DE BASE DE DATOS

### 6.1 Tablas implementadas

Definidas en `app/src/config/init-database.js`:

**`planta_info`** — Información científica

```sql
CREATE TABLE planta_info (
    nombre_cientifico TEXT PRIMARY KEY,
    genero TEXT,
    descripcion TEXT,
    principio_activo TEXT,
    propiedades_curativas TEXT,
    morfologia TEXT,
    bibliografia TEXT,
    distribucion_geografica TEXT,
    fotos_crecimiento TEXT   -- JSON array de rutas
);
```

**`planta_fisica`** — Inventario en el jardín

```sql
CREATE TABLE planta_fisica (
    id_planta INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres_comunes TEXT,
    fecha_sembrada TEXT,
    situacion TEXT,
    nombre_cientifico TEXT,
    FOREIGN KEY (nombre_cientifico) REFERENCES planta_info(nombre_cientifico)
);
```

**`distribucion`**

```sql
CREATE TABLE distribucion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distribucion TEXT,
    nombre_cientifico TEXT,
    FOREIGN KEY (nombre_cientifico) REFERENCES planta_info(nombre_cientifico)
);
```

**`usuarios`**

```sql
CREATE TABLE usuarios (
    correo TEXT PRIMARY KEY,
    usuario TEXT UNIQUE,
    password TEXT NOT NULL,
    nombre TEXT,
    tipo TEXT    -- 'admin' | 'usuario'
);
```

**`donaciones`** (expuesta como “solicitudes” en la API)

```sql
CREATE TABLE donaciones (
    id_donacion INTEGER PRIMARY KEY AUTOINCREMENT,
    detalles TEXT,
    motivo TEXT,
    fecha_donacion TEXT,
    fecha_aceptada TEXT,
    estado TEXT,           -- 'En proceso' | 'Aceptada' | 'Rechazada'
    correo_usuario TEXT,
    FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo)
);
```

**`remedios`**, **`pasos`**, **`contraindicaciones`**, **`efectos_secundarios`**

```sql
CREATE TABLE remedios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    checar_medico INTEGER DEFAULT 1,
    tiempo_efectividad TEXT DEFAULT 'N/A',
    parte TEXT,
    formato TEXT,
    dosis_cantidad REAL,
    dosis_unidad TEXT,
    nombre_cientifico TEXT,
    FOREIGN KEY (nombre_cientifico) REFERENCES planta_info(nombre_cientifico)
);
-- pasos, contraindicaciones, efectos_secundarios: FK id_remedio → remedios(id) ON DELETE CASCADE
```

**`usos`** y **`remedios_usos`** (M:N)

```sql
CREATE TABLE usos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    tipo TEXT
);

CREATE TABLE remedios_usos (
    id_remedio INTEGER,
    id_uso INTEGER,
    PRIMARY KEY (id_remedio, id_uso),
    FOREIGN KEY (id_remedio) REFERENCES remedios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_uso) REFERENCES usos(id) ON DELETE CASCADE
);
```

### 6.2 Semilla inicial

Si `usuarios` está vacía al primer arranque:

- Correo: `admin@jardin.com`
- Usuario: `admin`
- Contraseña: `admin123` (bcrypt)
- Tipo: `admin`

### 6.3 Tablas del diagrama UML aún no implementadas

| Módulo | Tablas / funcionalidad |
|--------|------------------------|
| Cuidados | `TipoCuidado`, `Cuidado`, `Horarios` |
| Salud | `Enfermedad`, `PlantaFisica_Enfermedad` |
| Notificaciones | `Notificacion` |
| Donación extendida | Campos adicionales del modelo UML completo |

---

## 7. API ENDPOINTS

Base URL: `http://localhost:3001` (desarrollo).

### 7.1 General

```
GET  /api              Información y listado de módulos
```

### 7.2 Autenticación — `/api/auth`

```
POST /api/auth/registro     Registrar usuario
POST /api/auth/login        Login (JWT + sesión)
GET  /api/auth/me           Usuario autenticado [JWT]
```

### 7.3 Plantas — `/api/plantas`

Identificador principal: `nombre_cientifico`.

```
GET    /api/plantas                              Listar (JOIN planta_fisica + planta_info)
GET    /api/plantas/:nombre_cientifico           Detalle
POST   /api/plantas                              Crear [Admin, JWT, multipart]
PUT    /api/plantas/:nombre_cientifico           Actualizar [Admin]
POST   /api/plantas/:nombre_cientifico/actualizar  Actualizar (compat. multipart) [Admin]
DELETE /api/plantas/:nombre_cientifico           Eliminar [Admin]
```

### 7.4 Donaciones — `/api/solicitudes`

Persistencia en tabla `donaciones`.

```
GET    /api/solicitudes              Listar (admin: todas; usuario: propias) [JWT]
GET    /api/solicitudes/:id          Detalle [JWT]
POST   /api/solicitudes              Crear donación [JWT]
PUT    /api/solicitudes/:id/estatus  Cambiar estado [Admin]
DELETE /api/solicitudes/:id          Eliminar [JWT, permisos]
```

### 7.5 Remedios — `/api/remedios`

```
GET    /api/remedios                 Listar (?nombre_cientifico=...)
GET    /api/remedios/:id             Detalle
POST   /api/remedios                 Crear [Admin]
PUT    /api/remedios/:id             Actualizar [Admin]
DELETE /api/remedios/:id             Eliminar [Admin]
```

### 7.6 Usos — `/api/usos`

```
GET    /api/usos                     Listar
GET    /api/usos/:id                 Detalle
POST   /api/usos                     Crear [Admin]
PUT    /api/usos/:id                 Actualizar [Admin]
DELETE /api/usos/:id                 Eliminar [Admin]
```

### 7.7 Usuarios — `/api/usuarios`

```
GET    /api/usuarios                 Listar [Admin]
GET    /api/usuarios/:usuario        Detalle [Admin]
POST   /api/usuarios                 Crear [Admin]
PUT    /api/usuarios/:usuario        Actualizar [Admin]
DELETE /api/usuarios/:usuario        Eliminar [Admin]
```

### 7.8 Sistema — `/api/system`

```
GET  /api/system/backup              Descargar .sqlite [Admin]
POST /api/system/restore             Restaurar .sqlite [Admin, multipart]
```

### 7.9 Frontend estático

Express sirve `frontend/` en la raíz. Rutas no encontradas devuelven `index.html` (fallback SPA ligero). Páginas principales:

| Ruta (archivo) | Acceso |
|----------------|--------|
| `/index.html` | Público |
| `/login.html`, `/registro.html` | Público |
| `/perfil.html`, `/mis-solicitudes.html` | Usuario autenticado (validación en cliente) |
| `/admin.html` | Administrador |
| `/historia.html` | Público |

---

## 8. SEGURIDAD

### 8.1 Medidas implementadas

- Contraseñas con bcrypt (factor 10)
- JWT con expiración de 24 horas
- Sesiones con cookies `httpOnly`; `secure` en producción
- Validación de entradas (`express-validator` donde aplica)
- Validación MIME en uploads de imágenes
- Límites de tamaño en Multer
- CORS habilitado
- Foreign keys en SQLite
- `trust proxy` habilitado para despliegue detrás de proxy inverso (Nginx en EC2)

### 8.2 Archivos que no deben versionarse

- `app/.env`
- `app/node_modules/`
- `respaldo_*.sqlite`, `database_restore.sqlite`, `*.bak`
- Uploads masivos en `frontend/recursos/imagenes/` (según política del equipo)

> `app/database.sqlite` puede incluirse para despliegue inicial según `.gitignore` del repositorio.

---

## 9. COMPATIBILIDAD

### 9.1 Navegadores

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Opera 76+.

### 9.2 Dispositivos

Desktop, tablet y móvil (diseño responsive; mínimo ~320px).

---

## 10. RENDIMIENTO Y CAPACIDAD

| Métrica | Estimación |
|---------|------------|
| Usuarios concurrentes | 100–500 (entorno educativo) |
| Escrituras SQLite | ~50 TPS (orden de magnitud) |
| Imágenes | Miles de archivos en disco persistente |

Optimizaciones típicas en producción: gzip en proxy, cache de estáticos.

---

## 11. LIMITACIONES Y CONSIDERACIONES

### 11.1 Técnicas

- SQLite no escala a miles de escrituras concurrentes
- Sin CDN para imágenes (almacenamiento local en el volumen EC2)
- Sin WebSockets ni notificaciones push

### 11.2 No incluido en esta versión

- Cuidados programados y horarios
- Catálogo de enfermedades
- Notificaciones automáticas
- Búsqueda full-text avanzada
- Integración con APIs externas

---

## 12. ESTADO DEL PROYECTO

### 12.1 Implementado

- Arquitectura desacoplada (frontend estático + API REST)
- Autenticación JWT y sesiones
- Esquema dual `planta_info` / `planta_fisica`
- CRUD de plantas con subida de imágenes
- Remedios (pasos, contraindicaciones, efectos secundarios, usos M:N)
- Catálogo de usos terapéuticos
- Donaciones (`donaciones` vía `/api/solicitudes`)
- CRUD de usuarios (admin)
- Respaldo y restauración de base de datos
- Panel `admin.html` y vistas de usuario
- Despliegue en AWS EC2 (`3.12.148.33`) con almacenamiento persistente (`DATA_PATH`)

### 12.2 Pendiente (diagrama UML extendido)

- Sistema de cuidados (`TipoCuidado`, `Cuidado`, `Horarios`)
- Enfermedades y relación con plantas físicas
- Notificaciones del jardín
- Modelo de donación con vínculo a `planta_fisica`

---

## 13. CONTACTO

| Campo | Valor |
|-------|-------|
| Proyecto | Sistema de Gestión del Jardín Botánico de Plantas Medicinales |
| Institución | Universidad Juárez Autónoma de Tabasco (UJAT) |
| Repositorio | https://github.com/Licho04/JardinBotanico- |
| Versión documento | 2.0 |
| Fecha | Mayo 2026 |

---

**FIN DEL DOCUMENTO**
