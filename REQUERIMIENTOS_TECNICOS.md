# REQUERIMIENTOS TÉCNICOS DEL SISTEMA
## Sistema de Gestión del Jardín Botánico de Plantas Medicinales UJAT

**Versión:** 1.0
**Fecha:** Diciembre 2025
**Desarrolladores:** Luis & Svein

---

## 1. TECNOLOGÍAS UTILIZADAS

### 1.1 Backend
- **Lenguaje:** JavaScript (Node.js)
- **Runtime:** Node.js 18.x LTS
- **Framework web:** Express.js 4.18.2
- **Gestor de paquetes:** npm 9.x
- **Tipo de módulos:** ES Modules (`"type": "module"`)

### 1.2 Base de Datos
- **Sistema:** SQLite 3.40+
- **Driver:** sqlite3 v5.1.7 (npm)
- **Archivo:** `app/database.sqlite`
- **ORM:** No se utiliza (queries nativas con promesas)

### 1.3 Autenticación y Seguridad
- **Hash de contraseñas:** bcrypt v5.1.1
- **Tokens JWT:** jsonwebtoken v9.0.2
- **Sesiones:** express-session v1.18.1
- **Cookies:** cookie-parser v1.4.7
- **Validación:** express-validator v7.0.1
- **CORS:** cors v2.8.5

### 1.4 Frontend
- **Motor de plantillas:** EJS v3.1.10 (renderizado en servidor)
- **HTML/CSS:** HTML5, CSS3 estándar
- **JavaScript cliente:** Vanilla JS (sin frameworks)
- **Iconos:** Font Awesome 6.0.0 (CDN)
- **Diseño:** Responsive con media queries CSS

### 1.5 Manejo de Archivos
- **Upload de imágenes:** Multer v1.4.5
- **Formatos soportados:** JPEG, JPG, PNG, GIF, WEBP, AVIF
- **Tamaño máximo:** 5 MB por archivo
- **Almacenamiento:** Sistema de archivos local (`recursos/imagenes/`)

### 1.6 Variables de Entorno
- **Gestor:** dotenv v16.4.7
- **Archivo:** `app/.env`

---

## 2. REQUERIMIENTOS DE SOFTWARE

### 2.1 Sistema Operativo
- **Linux:** Ubuntu 20.04/22.04 LTS, Debian 11+, CentOS 8+ (recomendado)
- **Alternativa:** Windows Server 2019+, macOS (cualquier SO con soporte Node.js)

### 2.2 Software Requerido en el Servidor
- **Node.js:** 16.x o superior (18.x LTS recomendado)
- **npm:** 8.x o superior
- **SQLite3:** 3.35+ (client CLI opcional)
- **Servidor web (producción):** Nginx 1.18+ o Apache 2.4+
- **Gestor de procesos (producción):** PM2 5.x (recomendado)
- **SSL/TLS (producción):** Certbot (Let's Encrypt) o certificado institucional

---

## 3. DEPENDENCIAS DEL PROYECTO

### 3.1 Dependencias de Producción (npm)
Instaladas automáticamente con `npm install`:

```
express: ^4.18.2          - Framework web
sqlite3: ^5.1.7           - Driver SQLite
bcrypt: ^5.1.1            - Hash de contraseñas
jsonwebtoken: ^9.0.2      - Autenticación JWT
cookie-parser: ^1.4.7     - Parser de cookies
express-session: ^1.18.1  - Manejo de sesiones
express-validator: ^7.0.1 - Validación de datos
ejs: ^3.1.10              - Motor de plantillas
multer: ^1.4.5            - Upload de archivos
cors: ^2.8.5              - Cross-Origin Resource Sharing
dotenv: ^16.4.7           - Variables de entorno
```

### 3.2 Dependencias de Desarrollo (opcional)
```
nodemon: para desarrollo local (auto-restart al guardar cambios)
```

---

## 4. CONFIGURACIÓN REQUERIDA

### 4.1 Variables de Entorno
Archivo `app/.env` (crear manualmente):

```env
NODE_ENV=production
PORT=3000
USE_SQLITE=true
JWT_SECRET=[generar-secreto-64-caracteres]
SESSION_SECRET=[generar-secreto-diferente]
BASE_URL=https://jardin-botanico.ujat.mx
```

**Nota:** Los secretos deben generarse de forma única para producción.

### 4.2 Permisos de Archivos (Linux)

| Archivo/Directorio | Permisos | Descripción |
|-------------------|----------|-------------|
| `app/.env` | `600` | Solo lectura para propietario |
| `app/database.sqlite` | `664` | Lectura/escritura para aplicación |
| `recursos/imagenes/` | `775` | Escritura para uploads |
| `app/` | `755` | Directorio principal |

### 4.3 Puertos de Red

| Puerto | Uso | Acceso |
|--------|-----|--------|
| 3000 | Aplicación Node.js | Interno (localhost) |
| 80 | HTTP (Nginx/Apache) | Público |
| 443 | HTTPS (Nginx/Apache) | Público |

---

## 5. ESTRUCTURA DEL PROYECTO

```
jardin-botanico/
├── app/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         - Conexión SQLite
│   │   │   └── init-database.js    - Inicialización de tablas
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── plantas.controller.js
│   │   │   └── solicitudes.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── plantas.routes.js
│   │   │   ├── solicitudes.routes.js
│   │   │   └── views/              - Rutas de vistas
│   │   ├── views/                  - Plantillas EJS
│   │   └── server.js               - Punto de entrada
│   ├── package.json
│   ├── package-lock.json
│   ├── database.sqlite             - Base de datos (generado)
│   └── .env                        - Variables de entorno (crear)
├── recursos/
│   ├── imagenes/                   - Imágenes de plantas (ESCRITURA)
│   └── estilos/
│       └── styles.css
└── render.yaml                     - Configuración Render.com
```

---

## 6. ESQUEMA DE BASE DE DATOS

### 6.1 Estado Actual - Tablas Implementadas ✅

**usuarios**
```sql
CREATE TABLE usuarios (
    usuario TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    mail TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,      -- bcrypt hash
    tipo INTEGER DEFAULT 0       -- 0=usuario, 1=admin
);
```

**plantas**
```sql
CREATE TABLE plantas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    imagen TEXT,
    propiedades TEXT,
    nombre_cientifico TEXT,
    zona_geografica TEXT,
    usos TEXT
);
```

**solicitudes**
```sql
CREATE TABLE solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL,
    nombre_planta TEXT NOT NULL,
    descripcion_planta TEXT NOT NULL,
    propiedades_medicinales TEXT,
    ubicacion TEXT NOT NULL,
    motivo_donacion TEXT,
    estado TEXT DEFAULT 'pendiente',
    fecha TEXT NOT NULL,
    respuesta TEXT,
    FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
);
```

### 6.2 Tablas Planificadas (Pendientes de Implementación) ⏳

**PlantaInfo** - Información científica de especies
```sql
CREATE TABLE PlantaInfo (
    NombreCientifico TEXT PRIMARY KEY,
    Filo TEXT,
    Clase TEXT,
    Orden TEXT,
    Familia TEXT,
    Genero TEXT,
    Descripcion TEXT
);
```

**PlantaFisica** - Plantas físicas individuales del jardín
```sql
CREATE TABLE PlantaFisica (
    IdPlanta INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreCientifico TEXT NOT NULL,
    NombrePropio TEXT,
    FechaSembrada DATETIME,
    Situacion TEXT CHECK(Situacion IN ('Sana', 'Desatendida', 'Enferma', 'Muerta')),
    FOREIGN KEY (NombreCientifico) REFERENCES PlantaInfo(NombreCientifico)
);
```

**Remedio** - Remedios medicinales
```sql
CREATE TABLE Remedio (
    IdRemedio INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPlanta INTEGER NOT NULL,
    Descripcion TEXT,
    ChecarMedico BOOLEAN DEFAULT 1,
    TiempoEfectividad TEXT DEFAULT 'N/A',
    Usos TEXT,
    FOREIGN KEY (IdPlanta) REFERENCES PlantaFisica(IdPlanta)
);
```

**Paso** - Pasos de preparación de remedios
```sql
CREATE TABLE Paso (
    IdRemedio INTEGER,
    NumPaso INTEGER,
    DescripcionPaso TEXT,
    PRIMARY KEY (IdRemedio, NumPaso),
    FOREIGN KEY (IdRemedio) REFERENCES Remedio(IdRemedio)
);
```

**TipoCuidado** - Tipos de cuidados
```sql
CREATE TABLE TipoCuidado (
    IdTipoCuidado INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    UnidadMedida TEXT,
    CantidadTiempo TIME
);
```

**Cuidado** - Cuidados asignados a plantas
```sql
CREATE TABLE Cuidado (
    IdCuidado INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPlanta INTEGER NOT NULL,
    IdTipoCuidado INTEGER NOT NULL,
    Frecuencia TIME,
    VecesPorSemana INTEGER,
    VecesAtendido INTEGER DEFAULT 0,
    Estado TEXT CHECK(Estado IN ('Completado', 'Parcialmente completado', 'Incompleto')),
    MaxNumeroHorarios INTEGER DEFAULT 20,
    FOREIGN KEY (IdPlanta) REFERENCES PlantaFisica(IdPlanta),
    FOREIGN KEY (IdTipoCuidado) REFERENCES TipoCuidado(IdTipoCuidado)
);
```

**Horarios** - Horarios de cuidados programados
```sql
CREATE TABLE Horarios (
    IdCuidado INTEGER,
    HoraDeCreacion DATETIME,
    EmpiezaHoraCreacion BOOLEAN DEFAULT 1,
    TiempoRetraso TIME DEFAULT '00:00:00',
    HoraDeCumplimiento DATETIME,
    Estado TEXT CHECK(Estado IN ('Sin complementar', 'Completado', 'Completado con retraso', 'Retrasado')),
    PRIMARY KEY (IdCuidado, HoraDeCreacion),
    FOREIGN KEY (IdCuidado) REFERENCES Cuidado(IdCuidado)
);
```

**Notificacion** - Notificaciones del sistema
```sql
CREATE TABLE Notificacion (
    IdNotificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPlanta INTEGER NOT NULL,
    Descripcion TEXT,
    TipoQueja TEXT,
    HoraCreacion DATETIME,
    HoraAceptacion DATETIME,
    Automatica BOOLEAN DEFAULT 0,
    Estado TEXT CHECK(Estado IN ('En espera', 'Aceptada', 'Rechazada', 'Obligatoria')),
    FOREIGN KEY (IdPlanta) REFERENCES PlantaFisica(IdPlanta)
);
```

**Enfermedad** - Catálogo de enfermedades
```sql
CREATE TABLE Enfermedad (
    IdEnfermedad INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreEnfermedad TEXT NOT NULL,
    TipoEnfermedad TEXT CHECK(TipoEnfermedad IN ('Parásitos', 'Hongos', 'Virus', 'Bacterias', 'Entorno'))
);
```

**PlantaFisica_Enfermedad** - Relación plantas-enfermedades
```sql
CREATE TABLE PlantaFisica_Enfermedad (
    IdPlanta INTEGER,
    IdEnfermedad INTEGER,
    FechaDeteccion DATETIME,
    PRIMARY KEY (IdPlanta, IdEnfermedad),
    FOREIGN KEY (IdPlanta) REFERENCES PlantaFisica(IdPlanta),
    FOREIGN KEY (IdEnfermedad) REFERENCES Enfermedad(IdEnfermedad)
);
```

**Donacion (versión extendida)** - Modelo extendido de donaciones
```sql
CREATE TABLE Donacion (
    IdDonacion INTEGER PRIMARY KEY AUTOINCREMENT,
    Correo TEXT NOT NULL,
    IdPlanta INTEGER,
    Detalles TEXT,
    Motivo TEXT,
    FechaDonacion DATETIME,
    FechaAceptada DATETIME,
    Estado TEXT CHECK(Estado IN ('Aceptada', 'Rechazada', 'En proceso')),
    FOREIGN KEY (Correo) REFERENCES Usuarios(Correo),
    FOREIGN KEY (IdPlanta) REFERENCES PlantaFisica(IdPlanta)
);
```

### 6.3 Inicialización de Base de Datos
- Las tablas actuales se crean automáticamente al iniciar la aplicación
- Script: `app/src/config/init-database.js`
- Foreign keys habilitadas: `PRAGMA foreign_keys = ON`

---

## 7. API ENDPOINTS

### 7.1 Endpoints Implementados ✅

**Autenticación**
```
POST /api/auth/registro       - Registrar usuario
POST /api/auth/login          - Login (retorna JWT)
```

**Plantas**
```
GET    /api/plantas           - Listar todas (público)
GET    /api/plantas/:id       - Detalle (público)
POST   /api/plantas           - Crear (admin, JWT)
PUT    /api/plantas/:id       - Actualizar (admin, JWT)
DELETE /api/plantas/:id       - Eliminar (admin, JWT)
```

**Solicitudes**
```
GET    /api/solicitudes       - Listar (JWT, filtrado por rol)
GET    /api/solicitudes/:id   - Detalle (JWT, permisos)
POST   /api/solicitudes       - Crear (JWT)
PUT    /api/solicitudes/:id/estatus  - Actualizar estado (admin, JWT)
DELETE /api/solicitudes/:id   - Eliminar (JWT, permisos)
```

**Vistas (Renderizadas con EJS)**
```
GET /                         - Página principal
GET /auth/login               - Login
GET /auth/registro            - Registro
GET /usuario/perfil           - Perfil (requiere auth)
GET /usuario/historia         - Historia del jardín
GET /usuario/mis-solicitudes  - Solicitudes del usuario (requiere auth)
GET /administracion/admin     - Panel admin (requiere admin)
```

### 7.2 Endpoints Planificados (Pendientes) ⏳

**PlantaInfo (Taxonomía)**
```
GET    /api/plantasInfo
GET    /api/plantasInfo/:nombreCientifico
POST   /api/plantasInfo                     [Admin]
PUT    /api/plantasInfo/:nombreCientifico   [Admin]
DELETE /api/plantasInfo/:nombreCientifico   [Admin]
```

**PlantaFisica**
```
GET    /api/plantasFisicas
GET    /api/plantasFisicas/:id
POST   /api/plantasFisicas                  [Admin]
PUT    /api/plantasFisicas/:id              [Admin]
DELETE /api/plantasFisicas/:id              [Admin]
```

**Remedios**
```
GET    /api/remedios
GET    /api/remedios/:id
POST   /api/remedios                        [Admin]
PUT    /api/remedios/:id                    [Admin]
DELETE /api/remedios/:id                    [Admin]
```

**Pasos de Remedios**
```
GET    /api/remedios/:id/pasos
POST   /api/remedios/:id/pasos              [Admin]
PUT    /api/remedios/:id/pasos/:numPaso     [Admin]
DELETE /api/remedios/:id/pasos/:numPaso     [Admin]
```

**Cuidados y Horarios**
```
GET    /api/plantasFisicas/:id/cuidados
POST   /api/plantasFisicas/:id/cuidados     [Admin]
GET    /api/horarios/pendientes
POST   /api/cuidados/:id/horarios/:fecha/completar  [Admin]
```

**Notificaciones**
```
GET    /api/notificaciones
GET    /api/notificaciones/pendientes
POST   /api/notificaciones                  [Admin]
PUT    /api/notificaciones/:id/aceptar      [Admin]
```

**Enfermedades**
```
GET    /api/enfermedades
POST   /api/enfermedades                    [Admin]
GET    /api/plantasFisicas/:id/enfermedades
POST   /api/plantasFisicas/:id/enfermedades [Admin]
```

---

## 8. SEGURIDAD

### 8.1 Medidas Implementadas
- ✅ Contraseñas hasheadas con bcrypt (factor 10)
- ✅ Tokens JWT con expiración de 24 horas
- ✅ Sesiones HTTP-only con cookies seguras
- ✅ Validación de inputs con express-validator
- ✅ Validación de tipos MIME en uploads
- ✅ Límite de tamaño en archivos (5MB)
- ✅ CORS configurado
- ✅ Foreign keys en base de datos habilitadas

### 8.2 Archivos Sensibles
**NO versionar en Git:**
- `app/.env`
- `app/database.sqlite`
- `app/node_modules/`
- `recursos/imagenes/*` (uploads)

---

## 9. COMPATIBILIDAD

### 9.1 Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

### 9.2 Dispositivos
- Desktop (Windows, macOS, Linux)
- Tablet (iOS, Android)
- Móvil (iOS, Android) - diseño responsive

### 9.3 Resoluciones de Pantalla
- Mínima: 320px (móviles)
- Óptima: 1366px+ (desktop)
- Implementación: Media queries CSS

---

## 10. RENDIMIENTO Y CAPACIDAD

### 10.1 Optimizaciones Implementadas
- Compresión gzip (configurado en Nginx)
- Cache de archivos estáticos (30 días)
- Conexión keep-alive
- Interacciones AJAX sin recarga de página

### 10.2 Capacidad Estimada
- **Usuarios concurrentes:** 100-500
- **Transacciones/segundo:** ~50 (SQLite)
- **Almacenamiento de imágenes:** ~1000 imágenes (5GB aprox.)

---

## 11. LIMITACIONES Y CONSIDERACIONES

### 11.1 Limitaciones Técnicas
- SQLite no es óptimo para más de 1000 usuarios concurrentes
- Sin soporte para escrituras concurrentes masivas
- Almacenamiento de imágenes local (no usa CDN)

### 11.2 Funcionalidades No Incluidas
- Sistema de notificaciones push en tiempo real
- Búsqueda avanzada con filtros múltiples
- Chat en tiempo real
- Integración con APIs externas
- Sistema de geolocalización
- Compatibilidad con dispositivos periféricos especializados

### 11.3 Infraestructura
- No requiere hardware especializado
- No requiere conexión a dispositivos externos
- No requiere sensores o periféricos sofisticados
- Sistema completamente basado en software

---

## 12. ESTADO DEL PROYECTO

### 12.1 Implementado ✅
- Sistema de autenticación (JWT + Sessions)
- CRUD de usuarios
- CRUD de plantas (catálogo simplificado)
- Sistema de solicitudes/donaciones
- Panel administrativo básico
- API REST funcional
- Interfaz web responsive

### 12.2 Planificado pero Pendiente ⏳
- Separación PlantaInfo (taxonomía científica) y PlantaFisica (instancias)
- Sistema de remedios medicinales con pasos
- Sistema de cuidados programados
- Sistema de horarios automáticos
- Notificaciones automáticas
- Catálogo de enfermedades
- Relación plantas-enfermedades

---

## 13. CONTACTO

**Proyecto:** Sistema de Gestión del Jardín Botánico de Plantas Medicinales
**Universidad:** Universidad Juárez Autónoma de Tabasco (UJAT)
**Desarrolladores:** Luis & Svein
**Repositorio:** https://github.com/Licho04/JardinBotanico-
**Versión:** 1.0
**Fecha:** Diciembre 2025

---

**FIN DEL DOCUMENTO**