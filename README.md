# Jardín de Plantas Medicinales — Sistema de Gestión

## Descripción del proyecto

Aplicación web para la gestión y consulta de un jardín de plantas medicinales. Los visitantes pueden explorar el catálogo, revisar propiedades curativas, consultar remedios naturales y enviar solicitudes de donación. Los administradores gestionan inventario, usuarios, remedios, usos terapéuticos y donaciones desde un panel dedicado.

**Arquitectura desacoplada:** el frontend son archivos estáticos (HTML, CSS y JavaScript vanilla) en `/frontend`, que consumen la API REST JSON del backend Node.js en `/app`. Ambas capas pueden desplegarse por separado.

## Créditos

| Rol | Responsable |
|-----|-------------|
| Diagrama de clases y estructura de tablas | **Angel Svein Ortiz Méndez** |
| Desarrollo (frontend, backend y funcionalidad) | **Luis Enrique Madrigal Martínez** |

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Node.js, Express.js (API REST) |
| Frontend | HTML5, CSS3, JavaScript (Fetch API) |
| Base de datos | SQLite3 |
| Autenticación | JWT, `express-session`, bcrypt |
| Archivos | Multer (imágenes y respaldos `.sqlite`) |

## Estructura del repositorio

```
JardinBotanico/
├── app/                          # Backend API
│   ├── src/
│   │   ├── config/               # Conexión e inicialización de BD
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/               # Rutas API (incl. api/)
│   │   ├── scripts/              # Utilidades de mantenimiento
│   │   └── server.js             # Punto de entrada
│   ├── database.sqlite           # BD local (desarrollo)
│   └── package.json
├── frontend/                     # Sitio estático
│   ├── index.html, login.html, admin.html, …
│   ├── forms/                    # Fragmentos HTML para modales del admin
│   └── recursos/
│       ├── estilos/styles.css
│       └── imagenes/             # Uploads en desarrollo
├── README.md
├── REQUERIMIENTOS_TECNICOS.md
└── REQUERIMIENTOS_FUNCIONALES_V2.md
```

Documentación técnica detallada: [REQUERIMIENTOS_TECNICOS.md](./REQUERIMIENTOS_TECNICOS.md).

## Modelo de datos (resumen)

El esquema sigue el diagrama UML del proyecto:

| Tabla | Propósito |
|-------|-----------|
| `planta_info` | Taxonomía y datos científicos (`nombre_cientifico` PK) |
| `planta_fisica` | Espécimen en el jardín (FK → `planta_info`) |
| `distribucion` | Distribución geográfica por especie |
| `remedios`, `pasos`, `contraindicaciones`, `efectos_secundarios` | Recetas y detalle |
| `usos`, `remedios_usos` | Catálogo de usos y relación M:N con remedios |
| `usuarios` | Cuentas (`correo` PK, `tipo`: `admin` \| `usuario`) |
| `donaciones` | Solicitudes de donación de plantas |

> La API expone donaciones bajo `/api/solicitudes` por compatibilidad con el frontend existente.

## Páginas del frontend

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Catálogo público y detalle de plantas |
| `login.html` / `registro.html` | Autenticación |
| `perfil.html` | Perfil del usuario |
| `historia.html` | Historia del jardín |
| `mis-solicitudes.html` | Donaciones del usuario |
| `admin.html` | Panel administrativo (CRUD completo) |

## Instalación local

### Requisitos

- [Node.js](https://nodejs.org/) 18.x LTS (o superior)
- npm 8+

### Pasos

1. Clona o descarga el repositorio.
2. En la terminal, entra a la carpeta del servidor:

   ```bash
   cd app
   ```

3. Instala dependencias e inicia el servidor:

   ```bash
   npm install
   npm start
   ```

4. Abre en el navegador: **http://localhost:3001**

   El puerto por defecto es `3001` (configurable con `PORT` en `.env`). Express sirve `frontend/` como archivos estáticos.

La base de datos SQLite se crea o verifica al arrancar (`init-database.js`). No hace falta instalar MySQL ni PostgreSQL.

### Variables de entorno (opcional)

Crea `app/.env` si necesitas personalizar el entorno:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=tu_secreto_largo_y_unico
# DB_PATH=ruta/absoluta/database.sqlite
# FRONTEND_PATH=ruta/absoluta/frontend
# DATA_PATH=/var/data          # Producción: datos persistentes en el servidor (EC2)
```

### Usuario administrador por defecto

Si la tabla `usuarios` está vacía al primer arranque, se crea:

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Correo | `admin@jardin.com` |
| Contraseña | `admin123` |

Cámbiala en producción en cuanto despliegues el sistema.

### Scripts de mantenimiento

| Script | Uso |
|--------|-----|
| `app/src/scripts/hash-passwords.js` | Migrar contraseñas en texto plano a bcrypt |

Ejecución (desde `app/`):

```bash
node src/scripts/hash-passwords.js
```

## API REST (resumen)

| Prefijo | Función |
|---------|---------|
| `GET /api` | Información de la API |
| `/api/auth` | Registro, login, sesión (`/me`) |
| `/api/plantas` | CRUD de plantas (info + física) |
| `/api/solicitudes` | Donaciones (listar, crear, cambiar estado) |
| `/api/remedios` | CRUD de remedios |
| `/api/usos` | Catálogo de usos terapéuticos |
| `/api/usuarios` | Gestión de usuarios (admin) |
| `/api/system` | Respaldo y restauración de BD (admin) |

Rutas de escritura sensibles requieren JWT y rol administrador.

## Despliegue en producción (AWS EC2)

El sistema está alojado en una instancia **AWS EC2** (Linux/UNIX):

| Dato | Valor |
|------|-------|
| Servidor | `3.12.148.33` (AWS EC2, Linux/UNIX) |
| Sitio web | [http://3.12.148.33/plantas/](http://3.12.148.33/plantas/) |
| API en producción | `http://3.12.148.33/plantas/api` *(el frontend usa el prefijo `/plantas` cuando no es `localhost`)* |

En el servidor, Node.js ejecuta la API y sirve el frontend estático. Se recomienda usar `DATA_PATH` (p. ej. `/var/data`) para que `database.sqlite` e imágenes subidas persistan fuera del directorio de despliegue.

Desde el panel de administración (`admin.html`) los administradores pueden:

- Descargar respaldo de la base de datos (`GET /api/system/backup`)
- Restaurar un archivo `.sqlite` (`POST /api/system/restore`)

Detalles de infraestructura, variables de entorno y permisos: [REQUERIMIENTOS_TECNICOS.md](./REQUERIMIENTOS_TECNICOS.md#4-configuración-requerida).

## Licencia

MIT — ver `app/package.json`.
