# REQUERIMIENTOS FUNCIONALES V2.0
## Sistema de Gestión del Jardín Botánico de Plantas Medicinales UJAT

**Fecha:** 13 de Diciembre de 2025
**Versión:** 2.0
**Basado en:** Diagrama UML + Notas 08-11-25 + Implementación actual

---

## 📋 ÍNDICE

1. [Alcance y Fases del Proyecto](#1-alcance-y-fases-del-proyecto)
2. [Gestión de Autenticación y Usuarios](#2-gestión-de-autenticación-y-usuarios)
3. [Catálogo de Plantas (PlantaInfo)](#3-catálogo-de-plantas-plantainfo)
4. [Plantas Físicas del Jardín](#4-plantas-físicas-del-jardín)
5. [Solicitudes y Donaciones](#5-solicitudes-y-donaciones)
6. [Remedios Medicinales](#6-remedios-medicinales)
7. [Sistema de Cuidados](#7-sistema-de-cuidados)
8. [Notificaciones](#8-notificaciones)
9. [Enfermedades](#9-enfermedades)
10. [Panel de Administración](#10-panel-de-administración)
11. [API REST - Endpoints](#11-api-rest---endpoints)
12. [Modelo de Datos Completo](#12-modelo-de-datos-completo)
13. [Seguridad](#13-seguridad)
14. [Matriz de Permisos](#14-matriz-de-permisos)

---

## 1. ALCANCE Y FASES DEL PROYECTO

### 1.1 Objetivo General
Desarrollar un sistema web integral para la gestión del Jardín Botánico de Plantas Medicinales que permita:
- Catalogar información científica de plantas (taxonomía completa)
- Gestionar plantas físicas individuales del jardín
- Administrar solicitudes de donación
- Registrar remedios medicinales con sus pasos de preparación
- Programar y controlar cuidados periódicos
- Generar notificaciones automáticas sobre el estado de las plantas
- Gestionar enfermedades de plantas

### 1.2 Fases de Implementación

#### **FASE 1 - IMPLEMENTADA** ✅
**Estado:** Completada
**Módulos:**
- ✅ Sistema de autenticación (JWT + Sessions)
- ✅ Gestión de usuarios (CRUD)
- ✅ Catálogo simplificado de plantas
- ✅ Sistema de solicitudes/donaciones
- ✅ Panel administrativo básico
- ✅ API REST funcional

#### **FASE 2 - PLANIFICADA** ⏳
**Estado:** Diseñada en diagrama UML
**Módulos:**
- ⏳ Separación PlantaInfo (taxonomía) y PlantaFisica (instancias)
- ⏳ Remedios medicinales con pasos
- ⏳ Sistema completo de cuidados
- ⏳ Notificaciones automáticas
- ⏳ Gestión de enfermedades

### 1.3 Distribución de Responsabilidades

| Desarrollador | Módulos Asignados |
|---------------|-------------------|
| **Luis** | Usuarios, PlantaFisica, Donaciones |
| **Svein** | PlantaInfo, Remedios, Pasos |
| **Pendiente** | Cuidados, Notificaciones, Enfermedades |

---

## 2. GESTIÓN DE AUTENTICACIÓN Y USUARIOS

### RF-U01: Registro de Usuario
**Prioridad:** ALTA
**Estado:** ✅ Implementado
**Responsable:** Luis

**Descripción:**
El sistema permite el registro de nuevos usuarios con validación de datos únicos.

**Criterios de Aceptación:**
- ✅ Campos requeridos: usuario (único), nombre, mail (único), password
- ✅ Validación de formato de email
- ✅ Hash de contraseña con bcrypt (factor 10)
- ✅ Tipo por defecto: 0 (usuario regular)
- ✅ Verificación de duplicados (usuario y mail)

**Endpoints:**
```
GET  /auth/registro        [Vista] Formulario registro
POST /auth/registro        [Vista] Procesar registro
POST /api/auth/registro    [API]   Registro JSON
```

**Request (API):**
```json
{
  "usuario": "juan_perez",
  "nombre": "Juan Pérez",
  "mail": "juan@example.com",
  "password": "miPassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "usuario": "juan_perez",
    "nombre": "Juan Pérez",
    "mail": "juan@example.com",
    "tipo": 0
  }
}
```

**Errores:**
- `400`: Datos inválidos o duplicados
- `500`: Error del servidor

---

### RF-U02: Inicio de Sesión
**Prioridad:** ALTA
**Estado:** ✅ Implementado
**Responsable:** Luis

**Descripción:**
Autenticación de usuarios con soporte dual (session-based para vistas, JWT para API).

**Criterios de Aceptación:**
- ✅ Login con usuario O email
- ✅ Verificación bcrypt (con backward compatibility texto plano)
- ✅ Generación JWT con expiración 24h (API)
- ✅ Creación de sesión con cookies HTTP-only (vistas)
- ✅ Token contiene: usuario, mail, tipo

**Endpoints:**
```
GET  /auth/login        [Vista] Formulario login
POST /auth/login        [Vista] Procesar login (crea sesión)
POST /api/auth/login    [API]   Login JSON (retorna JWT)
```

**Request (API):**
```json
{
  "usuario": "juan_perez",  // o "juan@example.com"
  "password": "miPassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "usuario": "juan_perez",
    "nombre": "Juan Pérez",
    "mail": "juan@example.com",
    "tipo": 0
  }
}
```

---

### RF-U03: Cerrar Sesión
**Prioridad:** MEDIA
**Estado:** ✅ Implementado

**Descripción:**
Permite a usuarios autenticados cerrar su sesión.

**Criterios de Aceptación:**
- ✅ Destruir sesión del servidor
- ✅ Redirección a página principal

**Endpoints:**
```
GET /auth/logout    [Vista] Cerrar sesión
```

---

### RF-U04: Gestión de Usuarios (Admin CRUD)
**Prioridad:** MEDIA
**Estado:** ✅ Implementado (vistas)

**Descripción:**
Administradores pueden gestionar usuarios del sistema.

**Criterios de Aceptación:**
- ✅ Solo tipo=1 (admin) puede acceder
- ✅ Listar todos los usuarios
- ✅ Crear nuevos usuarios (incluye asignación de tipo)
- ✅ Modificar datos: nombre, mail, tipo, password
- ✅ Eliminar usuarios (no permite auto-eliminación)

**Endpoints (Vistas):**
```
GET  /administracion/admin?vista=usuarios
GET  /administracion/usuarios/agregar
POST /administracion/usuarios/agregar
GET  /administracion/usuarios/modificar/:usuario
POST /administracion/usuarios/modificar/:usuario
POST /administracion/usuarios/eliminar/:usuario
```

**Pendiente (API REST):**
```
GET    /api/usuarios              [Admin] Listar todos
GET    /api/usuarios/:usuario     [Admin] Detalle
POST   /api/usuarios              [Admin] Crear
PUT    /api/usuarios/:usuario     [Admin] Actualizar
DELETE /api/usuarios/:usuario     [Admin] Eliminar
```

---

### RF-U05: Perfil de Usuario
**Prioridad:** BAJA
**Estado:** ✅ Implementado (básico)

**Descripción:**
Usuarios autenticados pueden ver su información personal.

**Criterios de Aceptación:**
- ✅ Requiere autenticación (sesión)
- ✅ Muestra: usuario, nombre, correo, tipo

**Endpoints:**
```
GET /usuario/perfil    [Vista] Página de perfil
```

**Futuras Mejoras:**
- Editar perfil
- Cambiar contraseña
- Historial de actividad

---

### RF-U06: Tipos de Usuario
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
El sistema maneja dos roles de usuario con permisos diferenciados.

**Tipos:**

| Tipo | Nombre | Permisos |
|------|--------|----------|
| 0 | Usuario Regular | Ver catálogo, crear solicitudes, ver mis solicitudes |
| 1 | Administrador | Permisos de usuario + CRUD completo de todo |

---

## 3. CATÁLOGO DE PLANTAS (PlantaInfo)

### RF-P01: Listar Plantas (Catálogo Público)
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Endpoint público que retorna todas las plantas del catálogo.

**Criterios de Aceptación:**
- ✅ Acceso sin autenticación
- ✅ Retorna todas las plantas con datos completos
- ✅ Incluye URL de imagen si existe

**Endpoints:**
```
GET /                 [Vista] Página principal con catálogo
GET /api/plantas      [API]   Listado JSON
```

**Response (API):**
```json
[
  {
    "id": 1,
    "nombre": "Manzanilla",
    "descripcion": "Planta medicinal de la familia Asteraceae...",
    "imagen": "manzanilla.jpg",
    "propiedades": "Antiinflamatoria, digestiva, calmante",
    "nombre_cientifico": "Matricaria chamomilla",
    "zona_geografica": "Europa, América del Norte",
    "usos": "Infusiones, aceites esenciales, uso tópico"
  }
]
```

---

### RF-P02: Obtener Detalle de Planta
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Consultar información detallada de una planta específica por ID.

**Criterios de Aceptación:**
- ✅ Acceso público (sin auth)
- ✅ Retorna 404 si no existe

**Endpoints:**
```
GET /api/plantas/:id       [API] Detalle JSON
POST /plantas/info         [AJAX] Info para modal (vista)
```

**Response (200 OK):**
```json
{
  "id": 1,
  "nombre": "Manzanilla",
  "descripcion": "Planta medicinal...",
  "imagen": "manzanilla.jpg",
  "propiedades": "Antiinflamatoria...",
  "nombre_cientifico": "Matricaria chamomilla",
  "zona_geografica": "Europa",
  "usos": "Infusiones, aceites..."
}
```

---

### RF-P03: Crear Planta (Admin)
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Administradores pueden agregar nuevas plantas al catálogo.

**Criterios de Aceptación:**
- ✅ Solo admin (tipo=1)
- ✅ Verificar token JWT (API) o sesión (vista)
- ✅ Upload de imagen con multer (multipart/form-data)
- ✅ Validación de formato: jpeg, jpg, png, gif, webp, avif
- ✅ Límite: 5MB
- ✅ Almacenamiento: `/recursos/imagenes/`
- ✅ Campos requeridos: nombre, descripcion

**Endpoints:**
```
GET  /administracion/plantas/agregar    [Vista] Formulario
POST /administracion/plantas/agregar    [Vista] Procesar
POST /api/plantas                       [API] Crear (JWT required)
```

**Request (API - multipart/form-data):**
```
nombre: "Albahaca"
descripcion: "Planta aromática..."
imagen: [archivo]
propiedades: "Digestiva, antibacteriana"
nombre_cientifico: "Ocimum basilicum"
zona_geografica: "Asia tropical"
usos: "Culinario, medicinal"
```

**Response (201 Created):**
```json
{
  "id": 42,
  "nombre": "Albahaca",
  "descripcion": "Planta aromática...",
  "imagen": "1702471234567-albahaca.jpg",
  "propiedades": "Digestiva, antibacteriana",
  "nombre_cientifico": "Ocimum basilicum",
  "zona_geografica": "Asia tropical",
  "usos": "Culinario, medicinal"
}
```

---

### RF-P04: Actualizar Planta (Admin)
**Prioridad:** MEDIA
**Estado:** ✅ Implementado

**Descripción:**
Administradores pueden modificar plantas existentes.

**Criterios de Aceptación:**
- ✅ Solo admin
- ✅ Si se provee nueva imagen, eliminar anterior
- ✅ Actualización parcial permitida

**Endpoints:**
```
GET  /administracion/plantas/modificar/:id    [Vista] Formulario pre-llenado
POST /administracion/plantas/modificar/:id    [Vista] Procesar
PUT  /api/plantas/:id                         [API] Actualizar
```

---

### RF-P05: Eliminar Planta (Admin)
**Prioridad:** MEDIA
**Estado:** ✅ Implementado

**Descripción:**
Administradores pueden eliminar plantas del catálogo.

**Criterios de Aceptación:**
- ✅ Solo admin
- ✅ Eliminar imagen asociada del filesystem
- ✅ Retornar 404 si no existe

**Endpoints:**
```
POST   /administracion/plantas/eliminar/:id    [Vista] Eliminar
DELETE /api/plantas/:id                        [API] Eliminar
```

**Response (200 OK):**
```json
{
  "message": "Planta eliminada exitosamente"
}
```

---

### RF-P06: Servir Imágenes de Plantas
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Endpoint público para servir imágenes de plantas.

**Criterios de Aceptación:**
- ✅ Acceso sin autenticación
- ✅ Archivos estáticos desde `/recursos/imagenes/`

**Endpoints:**
```
GET /recursos/imagenes/:filename
```

---

### RF-P07: Búsqueda en Tiempo Real
**Prioridad:** MEDIA
**Estado:** ✅ Implementado (frontend)

**Descripción:**
Búsqueda interactiva de plantas sin recargar la página.

**Criterios de Aceptación:**
- ✅ Filtrado case-insensitive
- ✅ Búsqueda en nombre de planta
- ✅ Actualización en tiempo real del listado

---

### RF-P08: Catálogo Científico Completo (PlantaInfo - UML)
**Prioridad:** MEDIA
**Estado:** ⏳ PENDIENTE (diseñado en UML)
**Responsable:** Svein

**Descripción:**
Separar la información taxonómica científica (especie) de las plantas físicas individuales.

**Modelo de Datos:**
```
PlantaInfo
- NombreCientifico: String {PK, unique}
- Filo: String
- Clase: String
- Orden: String
- Familia: String
- Genero: String
- Descripcion: String
```

**Relación:**
- PlantaInfo 1 ← 0..* PlantaFisica

**Endpoints Planificados:**
```
GET    /api/plantasInfo                    Listar especies
GET    /api/plantasInfo/:nombreCientifico  Detalle especie
POST   /api/plantasInfo                    [Admin] Crear especie
PUT    /api/plantasInfo/:nombreCientifico  [Admin] Actualizar
DELETE /api/plantasInfo/:nombreCientifico  [Admin] Eliminar
```

**Request (POST):**
```json
{
  "nombreCientifico": "Matricaria chamomilla",
  "filo": "Magnoliophyta",
  "clase": "Magnoliopsida",
  "orden": "Asterales",
  "familia": "Asteraceae",
  "genero": "Matricaria",
  "descripcion": "Planta herbácea anual de la familia Asteraceae..."
}
```

**Diferencia con Implementación Actual:**
- **Actual:** Tabla `plantas` mezcla info científica + instancia física
- **UML:** Separación clara: `PlantaInfo` (especie) + `PlantaFisica` (planta individual)

---

## 4. PLANTAS FÍSICAS DEL JARDÍN

### RF-PF01: Registrar Planta Física
**Prioridad:** MEDIA
**Estado:** ⏳ PENDIENTE (diseñado en UML)
**Responsable:** Luis

**Descripción:**
Registrar plantas físicas individuales del jardín, asociadas a una especie (PlantaInfo).

**Modelo de Datos:**
```
PlantaFisica
- IdPlanta: Int {PK, autoincrement}
- NombreCientifico: String {FK -> PlantaInfo}
- NombrePropio: String (opcional)
- FechaSembrada: DateTime
- Situacion: Enum {Sana, Desatendida, Enferma, Muerta}
```

**Criterios de Aceptación:**
- Asociación obligatoria a PlantaInfo
- Estado inicial: "Sana"
- Nombre propio opcional (ej: "Manzanilla del sector A3")
- Registro automático de fecha de siembra

**Endpoints Planificados:**
```
GET    /api/plantasFisicas           Listar todas las plantas físicas
GET    /api/plantasFisicas/:id       Detalle de planta física
POST   /api/plantasFisicas           [Admin] Crear planta física
PUT    /api/plantasFisicas/:id       [Admin] Actualizar
DELETE /api/plantasFisicas/:id       [Admin] Eliminar
```

**Request (POST):**
```json
{
  "nombreCientifico": "Matricaria chamomilla",
  "nombrePropio": "Manzanilla del invernadero A",
  "fechaSembrada": "2025-01-15T10:30:00Z",
  "situacion": "Sana"
}
```

**Response (201 Created):**
```json
{
  "idPlanta": 123,
  "nombreCientifico": "Matricaria chamomilla",
  "nombrePropio": "Manzanilla del invernadero A",
  "fechaSembrada": "2025-01-15T10:30:00Z",
  "situacion": "Sana"
}
```

---

### RF-PF02: Actualizar Estado de Planta Física
**Prioridad:** MEDIA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Cambiar el estado de salud de una planta física.

**Criterios de Aceptación:**
- Solo administradores
- Estados válidos: Sana, Desatendida, Enferma, Muerta
- Registro automático de fecha de cambio
- Al cambiar a "Enferma", puede asociar enfermedad

**Endpoints Planificados:**
```
PATCH /api/plantasFisicas/:id/estado    [Admin] Cambiar estado
```

**Request:**
```json
{
  "situacion": "Enferma",
  "observaciones": "Presenta manchas amarillas en hojas"
}
```

---

### RF-PF03: Consultar Plantas por Estado
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Filtrar plantas físicas según su estado de salud.

**Endpoints:**
```
GET /api/plantasFisicas?situacion=Enferma
GET /api/plantasFisicas?situacion=Desatendida
```

---

### RF-PF04: Obtener Imágenes de Planta Física
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Servir imágenes de plantas físicas mediante nombre científico o ID de planta.

**Endpoints (según notas):**
```
GET /recursos/imagenes/:nombreCientifico
GET /recursos/imagenes/:idPlanta
```

---

## 5. SOLICITUDES Y DONACIONES

### RF-D01: Crear Solicitud de Donación
**Prioridad:** ALTA
**Estado:** ✅ Implementado
**Responsable:** Luis

**Descripción:**
Usuarios autenticados pueden enviar solicitudes para donar plantas.

**Criterios de Aceptación:**
- ✅ Requiere autenticación (JWT o sesión)
- ✅ Estado inicial: "pendiente"
- ✅ Fecha automática (ISO format)
- ✅ Asociación automática al usuario autenticado

**Endpoints:**
```
POST /solicitudes/enviar    [Vista] Formulario
POST /api/solicitudes       [API] Crear solicitud (JWT)
```

**Request (API):**
```json
{
  "nombre_planta": "Albahaca morada",
  "descripcion_planta": "Planta aromática de 30cm de altura, hojas moradas",
  "propiedades_medicinales": "Digestiva, antioxidante, antiinflamatoria",
  "ubicacion": "Jardín trasero, Calle Reforma #123, Villahermosa",
  "motivo_donacion": "Exceso de producción en mi huerto urbano"
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "usuario": "juan_perez",
  "nombre_planta": "Albahaca morada",
  "descripcion_planta": "Planta aromática de 30cm de altura, hojas moradas",
  "propiedades_medicinales": "Digestiva, antioxidante, antiinflamatoria",
  "ubicacion": "Jardín trasero, Calle Reforma #123, Villahermosa",
  "motivo_donacion": "Exceso de producción en mi huerto urbano",
  "estado": "pendiente",
  "fecha": "2025-12-13T14:30:00.000Z",
  "respuesta": null
}
```

---

### RF-D02: Listar Solicitudes
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Consultar solicitudes con filtrado según rol.

**Criterios de Aceptación:**
- ✅ Usuario regular (tipo=0): Solo ve sus solicitudes
- ✅ Administrador (tipo=1): Ve todas las solicitudes
- ✅ Orden: Fecha descendente (recientes primero)

**Endpoints:**
```
GET /usuario/mis-solicitudes    [Vista] Solicitudes del usuario
GET /api/solicitudes            [API] Listado (filtrado por rol)
```

**Response (Admin):**
```json
[
  {
    "id": 42,
    "usuario": "juan_perez",
    "nombre_planta": "Albahaca morada",
    "descripcion_planta": "...",
    "estado": "pendiente",
    "fecha": "2025-12-13T14:30:00.000Z"
  }
]
```

---

### RF-D03: Obtener Detalle de Solicitud
**Prioridad:** MEDIA
**Estado:** ✅ Implementado

**Descripción:**
Consultar información completa de una solicitud específica.

**Criterios de Aceptación:**
- ✅ Usuario regular: Solo sus solicitudes
- ✅ Admin: Cualquier solicitud
- ✅ Retornar 403 si no tiene permisos
- ✅ Retornar 404 si no existe

**Endpoints:**
```
GET /api/solicitudes/:id    [API] Detalle (permisos verificados)
```

---

### RF-D04: Actualizar Estado de Solicitud (Admin)
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Administradores cambian el estado de solicitudes y agregan respuestas.

**Criterios de Aceptación:**
- ✅ Solo admin (tipo=1)
- ✅ Estados válidos: pendiente, aprobada, rechazada, en proceso
- ✅ Campo opcional: respuesta (mensaje del admin)
- ✅ Si se aprueba, registrar fecha de aceptación (futuro)

**Endpoints:**
```
GET  /administracion/solicitudes/responder/:id    [Vista] Formulario
POST /administracion/solicitudes/responder/:id    [Vista] Procesar
PUT  /api/solicitudes/:id/estatus                 [API] Actualizar
```

**Request (API):**
```json
{
  "estado": "aprobada",
  "respuesta": "Hemos programado la recolección para el 20/12/2025. Nos comunicaremos por correo."
}
```

**Response (200 OK):**
```json
{
  "id": 42,
  "usuario": "juan_perez",
  "nombre_planta": "Albahaca morada",
  "estado": "aprobada",
  "respuesta": "Hemos programado la recolección para el 20/12/2025. Nos comunicaremos por correo.",
  "fecha": "2025-12-13T14:30:00.000Z"
}
```

---

### RF-D05: Eliminar Solicitud
**Prioridad:** MEDIA
**Estado:** ✅ Implementado

**Descripción:**
Usuarios eliminan sus solicitudes, admins eliminan cualquiera.

**Criterios de Aceptación:**
- ✅ Usuario regular: Solo sus solicitudes
- ✅ Admin: Cualquier solicitud
- ✅ Retornar 403 si no tiene permisos

**Endpoints:**
```
POST   /administracion/solicitudes/eliminar/:id    [Vista] Eliminar
DELETE /api/solicitudes/:id                        [API] Eliminar
```

---

### RF-D06: Modelo Extendido de Donaciones (UML)
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE (diseñado en UML)

**Descripción:**
Ampliar modelo de donaciones según diagrama UML.

**Modelo de Datos (UML):**
```
Donacion
- IdDonacion: Int {PK}
- Correo: String {FK -> Usuarios.Correo}
- IdPlanta: Int {FK -> PlantaFisica, nullable}
- Detalles: String
- Motivo: String
- FechaDonacion: DateTime
- FechaAceptada: DateTime (nullable)
- Estado: Enum {Aceptada, Rechazada, En proceso}
```

**Diferencias con Implementación Actual:**
- Relación con Usuarios por Correo (FK)
- Asociación con PlantaFisica después de aceptar
- Separación FechaDonacion / FechaAceptada
- Estados diferentes

---

## 6. REMEDIOS MEDICINALES

### RF-R01: Registrar Remedio
**Prioridad:** MEDIA
**Estado:** ⏳ PENDIENTE (diseñado en UML)
**Responsable:** Svein

**Descripción:**
Registrar remedios medicinales asociados a plantas físicas.

**Modelo de Datos:**
```
Remedio
- IdRemedio: Int {PK}
- IdPlanta: Int {FK -> PlantaFisica}
- Descripcion: String
- ChecarMedico: Bool (default: True)
- TiempoEfectividad: String (default: "N/A")
- Usos: String
```

**Relación:**
- PlantaFisica 1 ← 0..* Remedio

**Criterios de Aceptación:**
- Asociación obligatoria a PlantaFisica
- Indicar si requiere consulta médica (default: True)
- Tiempo de efectividad opcional
- Lista de usos medicinales

**Endpoints Planificados:**
```
GET    /api/remedios                      Listar todos
GET    /api/remedios/:id                  Detalle de remedio
POST   /api/remedios                      [Admin] Crear
PUT    /api/remedios/:id                  [Admin] Actualizar
DELETE /api/remedios/:id                  [Admin] Eliminar
GET    /api/plantasFisicas/:id/remedios   Remedios de una planta
```

**Request (POST):**
```json
{
  "idPlanta": 123,
  "descripcion": "Infusión de manzanilla para problemas digestivos y nerviosismo",
  "checarMedico": false,
  "tiempoEfectividad": "15-30 minutos",
  "usos": "Dolor estomacal, gases, indigestión, ansiedad leve, insomnio"
}
```

**Response (201 Created):**
```json
{
  "idRemedio": 5,
  "idPlanta": 123,
  "descripcion": "Infusión de manzanilla para problemas digestivos y nerviosismo",
  "checarMedico": false,
  "tiempoEfectividad": "15-30 minutos",
  "usos": "Dolor estomacal, gases, indigestión, ansiedad leve, insomnio"
}
```

---

### RF-R02: Registrar Pasos de Preparación
**Prioridad:** MEDIA
**Estado:** ⏳ PENDIENTE (diseñado en UML)
**Responsable:** Svein

**Descripción:**
Registrar los pasos secuenciales de preparación de un remedio.

**Modelo de Datos:**
```
Paso
- IdRemedio: Int {FK -> Remedio, PK compuesta}
- NumPaso: Int {PK compuesta}
- DescripcionPaso: String
```

**Relación:**
- Remedio 1 ← 0..* Paso

**Criterios de Aceptación:**
- Clave primaria compuesta: (IdRemedio, NumPaso)
- Pasos numerados secuencialmente
- Orden de pasos respetado

**Endpoints Planificados:**
```
GET    /api/remedios/:id/pasos           Listar pasos
POST   /api/remedios/:id/pasos           [Admin] Crear pasos
PUT    /api/remedios/:id/pasos/:numPaso  [Admin] Actualizar paso
DELETE /api/remedios/:id/pasos/:numPaso  [Admin] Eliminar paso
```

**Request (POST - crear múltiples pasos):**
```json
{
  "pasos": [
    {
      "numPaso": 1,
      "descripcionPaso": "Hervir 250ml de agua hasta ebullición"
    },
    {
      "numPaso": 2,
      "descripcionPaso": "Agregar 1 cucharada sopera de flores de manzanilla secas"
    },
    {
      "numPaso": 3,
      "descripcionPaso": "Tapar y dejar reposar durante 5-7 minutos"
    },
    {
      "numPaso": 4,
      "descripcionPaso": "Colar y servir. Puede endulzar con miel si lo desea"
    }
  ]
}
```

**Response (GET /api/remedios/5):**
```json
{
  "idRemedio": 5,
  "idPlanta": 123,
  "descripcion": "Infusión de manzanilla para problemas digestivos",
  "checarMedico": false,
  "tiempoEfectividad": "15-30 minutos",
  "usos": "Dolor estomacal, gases, indigestión",
  "pasos": [
    {
      "numPaso": 1,
      "descripcionPaso": "Hervir 250ml de agua hasta ebullición"
    },
    {
      "numPaso": 2,
      "descripcionPaso": "Agregar 1 cucharada sopera de flores de manzanilla secas"
    },
    {
      "numPaso": 3,
      "descripcionPaso": "Tapar y dejar reposar durante 5-7 minutos"
    },
    {
      "numPaso": 4,
      "descripcionPaso": "Colar y servir. Puede endulzar con miel si lo desea"
    }
  ]
}
```

---

## 7. SISTEMA DE CUIDADOS

### RF-C01: Definir Tipos de Cuidado
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE (diseñado en UML)

**Descripción:**
Crear catálogo de tipos de cuidados que pueden aplicarse a plantas.

**Modelo de Datos:**
```
TipoCuidado
- IdTipoCuidado: Int {PK}
- Nombre: String
- UnidadMedida: String
- CantidadTiempo: Time (nullable)
```

**Ejemplos de Tipos:**
- Riego (litros, 5 minutos)
- Fertilización (gramos, N/A)
- Poda (N/A, 15 minutos)
- Control de plagas (ml, N/A)
- Trasplante (N/A, 30 minutos)

**Endpoints Planificados:**
```
GET    /api/tipos-cuidado        Listar tipos
POST   /api/tipos-cuidado        [Admin] Crear tipo
PUT    /api/tipos-cuidado/:id    [Admin] Actualizar
DELETE /api/tipos-cuidado/:id    [Admin] Eliminar
```

**Request (POST):**
```json
{
  "nombre": "Riego",
  "unidadMedida": "litros",
  "cantidadTiempo": "00:05:00"
}
```

---

### RF-C02: Asignar Cuidado a Planta Física
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Asignar cuidados periódicos programados a plantas físicas.

**Modelo de Datos:**
```
Cuidado
- IdCuidado: Int {PK}
- IdPlanta: Int {FK -> PlantaFisica}
- IdTipoCuidado: Int {FK -> TipoCuidado}
- Frecuencia: Time
- VecesPorSemana: Int
- VecesAtendido: Int (contador)
- Estado: Enum {Completado, Parcialmente completado, Incompleto}
- MaxNumeroHorarios: Int (default: 20)
```

**Relaciones:**
- PlantaFisica 1 ← 0..* Cuidado
- TipoCuidado 1 ← 0..* Cuidado

**Criterios de Aceptación:**
- Definir frecuencia (ej: cada 48 horas)
- Especificar veces por semana
- Límite de 20 horarios programados
- Contador automático de veces atendido

**Endpoints Planificados:**
```
GET    /api/plantasFisicas/:id/cuidados    Cuidados de una planta
POST   /api/plantasFisicas/:id/cuidados    [Admin] Asignar cuidado
PUT    /api/cuidados/:id                   [Admin] Actualizar cuidado
DELETE /api/cuidados/:id                   [Admin] Eliminar cuidado
```

**Request (POST):**
```json
{
  "idTipoCuidado": 1,
  "frecuencia": "48:00:00",
  "vecesPorSemana": 3,
  "estado": "Incompleto"
}
```

---

### RF-C03: Programar Horarios de Cuidado
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Generar y gestionar horarios automáticos para cuidados programados.

**Modelo de Datos:**
```
Horarios
- IdCuidado: Int {FK -> Cuidado, PK compuesta}
- HoraDeCreacion: DateTime {PK compuesta}
- EmpiezaHoraCreacion: Bool (default: True)
- TiempoRetraso: Time (default: 00:00:00)
- HoraDeCumplimiento: DateTime (nullable)
- Estado: Enum {Sin complementar, Completado, Completado con retraso, Retrasado}
```

**Relación:**
- Cuidado 1 ← 0..* Horarios

**Criterios de Aceptación:**
- Generación automática basada en frecuencia
- Registro de hora de creación
- Registro de hora de cumplimiento
- Cálculo automático de retraso
- Actualización de estado

**Endpoints Planificados:**
```
GET  /api/cuidados/:id/horarios                      Horarios de un cuidado
POST /api/cuidados/:id/horarios/:fecha/completar     [Admin] Marcar completado
GET  /api/horarios/pendientes                        Horarios pendientes (todos)
GET  /api/horarios/retrasados                        Horarios retrasados
```

**Response (GET pendientes):**
```json
[
  {
    "idCuidado": 10,
    "plantaNombre": "Manzanilla del invernadero A",
    "tipoCuidado": "Riego",
    "horaDeCreacion": "2025-12-13T08:00:00Z",
    "estado": "Sin complementar"
  }
]
```

---

## 8. NOTIFICACIONES

### RF-N01: Crear Notificación Manual
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE (diseñado en UML)

**Descripción:**
Administradores pueden crear notificaciones sobre plantas físicas.

**Modelo de Datos:**
```
Notificacion
- IdNotificacion: Int {PK}
- IdPlanta: Int {FK -> PlantaFisica}
- Descripcion: String
- TipoQueja: Enum (por definir)
- HoraCreacion: DateTime
- HoraAceptacion: DateTime (nullable)
- Automatica: Bool (default: False)
- Estado: Enum {En espera, Aceptada, Rechazada, Obligatoria}
```

**Relación:**
- PlantaFisica 1 ← 0..* Notificacion

**Criterios de Aceptación:**
- Asociación a PlantaFisica
- Descripción del problema
- Estado inicial: "En espera"
- Campo Automatica = False

**Endpoints Planificados:**
```
GET    /api/notificaciones              Listar todas
GET    /api/notificaciones/pendientes   Solo pendientes
POST   /api/notificaciones              [Admin] Crear
PUT    /api/notificaciones/:id/aceptar  [Admin] Aceptar
PUT    /api/notificaciones/:id/rechazar [Admin] Rechazar
DELETE /api/notificaciones/:id          [Admin] Eliminar
```

**Request (POST):**
```json
{
  "idPlanta": 123,
  "descripcion": "La planta presenta hojas amarillentas en el sector inferior",
  "tipoQueja": "Problema de salud",
  "estado": "En espera"
}
```

---

### RF-N02: Notificaciones Automáticas
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Sistema genera notificaciones automáticas basadas en eventos.

**Criterios de Aceptación:**
- Campo Automatica = True
- Estado: "Obligatoria" para críticas, "En espera" para normales
- Eventos que generan notificaciones:
  - Cuidado retrasado > 24 horas
  - PlantaFisica cambia a "Enferma"
  - PlantaFisica cambia a "Desatendida"
  - Múltiples horarios sin cumplir

**Ejemplo de Generación:**
```javascript
// Evento: Planta cambia a "Enferma"
{
  "idPlanta": 123,
  "descripcion": "ALERTA: La planta ha sido marcada como enferma",
  "tipoQueja": "Estado de salud",
  "automatica": true,
  "estado": "Obligatoria"
}
```

---

## 9. ENFERMEDADES

### RF-E01: Catalogar Enfermedades
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE (diseñado en UML)

**Descripción:**
Crear catálogo de enfermedades que pueden afectar plantas.

**Modelo de Datos:**
```
Enfermedad
- IdEnfermedad: Int {PK}
- NombreEnfermedad: String
- TipoEnfermedad: Enum {Parásitos, Hongos, Virus, Bacterias, Entorno}
```

**Ejemplos:**
- Oídio (Hongos)
- Pulgón (Parásitos)
- Virus del mosaico (Virus)
- Podredumbre bacteriana (Bacterias)
- Quemadura solar (Entorno)

**Endpoints Planificados:**
```
GET    /api/enfermedades        Listar todas
GET    /api/enfermedades/:id    Detalle
POST   /api/enfermedades        [Admin] Crear
PUT    /api/enfermedades/:id    [Admin] Actualizar
DELETE /api/enfermedades/:id    [Admin] Eliminar
```

**Request (POST):**
```json
{
  "nombreEnfermedad": "Oídio",
  "tipoEnfermedad": "Hongos"
}
```

---

### RF-E02: Asociar Enfermedad a Planta Física
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Registrar enfermedades que afectan a plantas físicas específicas (relación N:M).

**Tabla de Relación:**
```
PlantaFisica_Enfermedad
- IdPlanta: Int {FK -> PlantaFisica, PK}
- IdEnfermedad: Int {FK -> Enfermedad, PK}
- FechaDeteccion: DateTime
```

**Criterios de Aceptación:**
- Una planta puede tener múltiples enfermedades
- Una enfermedad puede afectar múltiples plantas
- Registrar fecha de detección
- Cambiar automáticamente PlantaFisica.Situacion a "Enferma"

**Endpoints Planificados:**
```
GET    /api/plantasFisicas/:id/enfermedades              Ver enfermedades de planta
POST   /api/plantasFisicas/:id/enfermedades              [Admin] Asociar enfermedad
DELETE /api/plantasFisicas/:id/enfermedades/:idEnfermedad [Admin] Desasociar
```

**Request (POST):**
```json
{
  "idEnfermedad": 3,
  "fechaDeteccion": "2025-12-13T10:00:00Z"
}
```

**Response (GET enfermedades de planta):**
```json
[
  {
    "idEnfermedad": 3,
    "nombreEnfermedad": "Oídio",
    "tipoEnfermedad": "Hongos",
    "fechaDeteccion": "2025-12-13T10:00:00Z"
  }
]
```

---

## 10. PANEL DE ADMINISTRACIÓN

### RF-A01: Acceso al Panel
**Prioridad:** ALTA
**Estado:** ✅ Implementado

**Descripción:**
Panel centralizado para administradores con tres vistas.

**Criterios de Aceptación:**
- ✅ Solo tipo=1 (admin)
- ✅ Middleware requireAdmin
- ✅ Tres vistas: usuarios, plantas, solicitudes

**Endpoints:**
```
GET /administracion/admin?vista=usuarios
GET /administracion/admin?vista=plantas
GET /administracion/admin?vista=solicitudes
```

---

### RF-A02: Dashboard de Cuidados (FUTURO)
**Prioridad:** BAJA
**Estado:** ⏳ PENDIENTE

**Descripción:**
Vista de administración de cuidados y horarios.

**Funcionalidades:**
- Ver cuidados pendientes del día
- Ver horarios retrasados
- Marcar cuidados como completados
- Estadísticas de cumplimiento

**Endpoints:**
```
GET /administracion/admin?vista=cuidados
```

---

## 11. API REST - ENDPOINTS

### 11.1 Endpoints Implementados ✅

#### Autenticación
```
POST /api/auth/registro    Registrar usuario
POST /api/auth/login       Login (retorna JWT)
```

#### Plantas
```
GET    /api/plantas        Listar todas (público)
GET    /api/plantas/:id    Detalle (público)
POST   /api/plantas        [Admin] Crear
PUT    /api/plantas/:id    [Admin] Actualizar
DELETE /api/plantas/:id    [Admin] Eliminar
```

#### Solicitudes
```
GET    /api/solicitudes              [Auth] Listar (filtrado por rol)
GET    /api/solicitudes/:id          [Auth] Detalle (permisos)
POST   /api/solicitudes              [Auth] Crear
PUT    /api/solicitudes/:id/estatus  [Admin] Actualizar estado
DELETE /api/solicitudes/:id          [Auth] Eliminar (permisos)
```

---

### 11.2 Endpoints Planificados ⏳

#### PlantaInfo (Taxonomía)
```
GET    /api/plantasInfo
GET    /api/plantasInfo/:nombreCientifico
POST   /api/plantasInfo                       [Admin]
PUT    /api/plantasInfo/:nombreCientifico     [Admin]
DELETE /api/plantasInfo/:nombreCientifico     [Admin]
```

#### PlantaFisica
```
GET    /api/plantasFisicas
GET    /api/plantasFisicas/:id
POST   /api/plantasFisicas                    [Admin]
PUT    /api/plantasFisicas/:id                [Admin]
PATCH  /api/plantasFisicas/:id/estado         [Admin]
DELETE /api/plantasFisicas/:id                [Admin]
```

#### Remedios
```
GET    /api/remedios
GET    /api/remedios/:id
POST   /api/remedios                          [Admin]
PUT    /api/remedios/:id                      [Admin]
DELETE /api/remedios/:id                      [Admin]
GET    /api/plantasFisicas/:id/remedios
```

#### Pasos de Remedios
```
GET    /api/remedios/:id/pasos
POST   /api/remedios/:id/pasos                [Admin]
PUT    /api/remedios/:id/pasos/:numPaso       [Admin]
DELETE /api/remedios/:id/pasos/:numPaso       [Admin]
```

#### Tipos de Cuidado
```
GET    /api/tipos-cuidado
POST   /api/tipos-cuidado                     [Admin]
PUT    /api/tipos-cuidado/:id                 [Admin]
DELETE /api/tipos-cuidado/:id                 [Admin]
```

#### Cuidados
```
GET    /api/plantasFisicas/:id/cuidados
POST   /api/plantasFisicas/:id/cuidados       [Admin]
PUT    /api/cuidados/:id                      [Admin]
DELETE /api/cuidados/:id                      [Admin]
```

#### Horarios
```
GET  /api/cuidados/:id/horarios
GET  /api/horarios/pendientes
GET  /api/horarios/retrasados
POST /api/cuidados/:id/horarios/:fecha/completar  [Admin]
```

#### Notificaciones
```
GET    /api/notificaciones
GET    /api/notificaciones/pendientes
POST   /api/notificaciones                    [Admin]
PUT    /api/notificaciones/:id/aceptar        [Admin]
PUT    /api/notificaciones/:id/rechazar       [Admin]
DELETE /api/notificaciones/:id                [Admin]
```

#### Enfermedades
```
GET    /api/enfermedades
GET    /api/enfermedades/:id
POST   /api/enfermedades                      [Admin]
PUT    /api/enfermedades/:id                  [Admin]
DELETE /api/enfermedades/:id                  [Admin]
GET    /api/plantasFisicas/:id/enfermedades
POST   /api/plantasFisicas/:id/enfermedades   [Admin]
DELETE /api/plantasFisicas/:id/enfermedades/:idEnfermedad  [Admin]
```

---

## 12. MODELO DE DATOS COMPLETO

### 12.1 Tablas Implementadas (SQLite)

#### usuarios
```sql
CREATE TABLE usuarios (
  usuario TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  mail TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  tipo INTEGER DEFAULT 0
);
```

#### plantas
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

#### solicitudes
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

---

### 12.2 Tablas Planificadas (UML)

#### PlantaInfo
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

#### PlantaFisica
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

#### Remedio
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

#### Paso
```sql
CREATE TABLE Paso (
  IdRemedio INTEGER,
  NumPaso INTEGER,
  DescripcionPaso TEXT,
  PRIMARY KEY (IdRemedio, NumPaso),
  FOREIGN KEY (IdRemedio) REFERENCES Remedio(IdRemedio)
);
```

#### Donacion (extendida)
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

#### TipoCuidado
```sql
CREATE TABLE TipoCuidado (
  IdTipoCuidado INTEGER PRIMARY KEY AUTOINCREMENT,
  Nombre TEXT NOT NULL,
  UnidadMedida TEXT,
  CantidadTiempo TIME
);
```

#### Cuidado
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

#### Horarios
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

#### Notificacion
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

#### Enfermedad
```sql
CREATE TABLE Enfermedad (
  IdEnfermedad INTEGER PRIMARY KEY AUTOINCREMENT,
  NombreEnfermedad TEXT NOT NULL,
  TipoEnfermedad TEXT CHECK(TipoEnfermedad IN ('Parásitos', 'Hongos', 'Virus', 'Bacterias', 'Entorno'))
);
```

#### PlantaFisica_Enfermedad
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

---

### 12.3 Diagrama de Relaciones (UML)

```
Usuarios 1 ──── 0..* Donacion
PlantaInfo 1 ──── 0..* PlantaFisica
PlantaFisica 1 ──── 0..1 Donacion
PlantaFisica 1 ──── 0..* Remedio
PlantaFisica 1 ──── 0..* Cuidado
PlantaFisica 1 ──── 0..* Notificacion
PlantaFisica N ──── M Enfermedad (PlantaFisica_Enfermedad)
Remedio 1 ──── 0..* Paso
TipoCuidado 1 ──── 0..* Cuidado
Cuidado 1 ──── 0..* Horarios
```

---

## 13. SEGURIDAD

### RF-S01: Encriptación de Contraseñas
**Estado:** ✅ Implementado

**Características:**
- ✅ Hash bcrypt con factor 10
- ✅ Backward compatibility con texto plano (migración)
- ✅ Nunca almacenar contraseñas en texto plano para nuevos usuarios

---

### RF-S02: Autenticación JWT (API)
**Estado:** ✅ Implementado

**Características:**
- ✅ Token en header: `Authorization: Bearer <token>`
- ✅ Expiración: 24 horas
- ✅ Payload: { usuario, mail, tipo }
- ✅ Secret: Variable de entorno JWT_SECRET

---

### RF-S03: Sesiones (Vistas Web)
**Estado:** ✅ Implementado

**Características:**
- ✅ express-session con cookies HTTP-only
- ✅ Secure flag en producción (HTTPS)
- ✅ Expiración: 24 horas de inactividad

---

### RF-S04: Validación de Permisos
**Estado:** ✅ Implementado

**Middleware:**
- ✅ `optionalAuth`: Agrega usuario si autenticado (no requiere)
- ✅ `requireAuth`: Requiere autenticación
- ✅ `requireAdmin`: Requiere tipo=1
- ✅ `verificarToken`: JWT para API
- ✅ `verificarAdmin`: Admin para API

---

### RF-S05: Validación de Uploads
**Estado:** ✅ Implementado

**Características:**
- ✅ Multer con límite 5MB
- ✅ Validación MIME type
- ✅ Extensiones permitidas: jpeg, jpg, png, gif, webp, avif
- ✅ Sanitización de nombres de archivo

---

### RF-S06: Base de Datos
**Estado:** ✅ Implementado

**Características:**
- ✅ Foreign keys habilitadas (`PRAGMA foreign_keys = ON`)
- ✅ Prepared statements (parameterized queries)
- ✅ Validación de integridad referencial

---

## 14. MATRIZ DE PERMISOS

### Recurso: Plantas

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Ver listado | ✅ | ✅ | ✅ |
| Ver detalle | ✅ | ✅ | ✅ |
| Crear | ❌ | ❌ | ✅ |
| Editar | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ✅ |

---

### Recurso: Solicitudes

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Ver todas | ❌ | ❌ | ✅ |
| Ver propias | ❌ | ✅ | ✅ |
| Crear | ❌ | ✅ | ✅ |
| Cambiar estado | ❌ | ❌ | ✅ |
| Eliminar propias | ❌ | ✅ | ✅ |
| Eliminar cualquiera | ❌ | ❌ | ✅ |

---

### Recurso: Usuarios

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Registrarse | ✅ | ✅ | ✅ |
| Ver listado | ❌ | ❌ | ✅ |
| Ver perfil propio | ❌ | ✅ | ✅ |
| Ver perfil otros | ❌ | ❌ | ✅ |
| Editar propio | ❌ | ⏳ | ✅ |
| Editar otros | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ✅ |

---

### Recurso: PlantasFisicas (Planificado)

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Ver listado | ✅ | ✅ | ✅ |
| Ver detalle | ✅ | ✅ | ✅ |
| Crear | ❌ | ❌ | ✅ |
| Editar | ❌ | ❌ | ✅ |
| Cambiar estado | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ✅ |

---

### Recurso: Remedios (Planificado)

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Ver listado | ✅ | ✅ | ✅ |
| Ver detalle | ✅ | ✅ | ✅ |
| Crear | ❌ | ❌ | ✅ |
| Editar | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ✅ |

---

### Recurso: Cuidados (Planificado)

| Acción | Anónimo | Usuario (tipo=0) | Admin (tipo=1) |
|--------|---------|------------------|----------------|
| Ver pendientes | ❌ | ❌ | ✅ |
| Ver retrasados | ❌ | ❌ | ✅ |
| Asignar cuidado | ❌ | ❌ | ✅ |
| Marcar completado | ❌ | ❌ | ✅ |
| Editar | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ✅ |

---

## 15. CONFIGURACIÓN DE ENTORNO

### Variables de Entorno (.env)
```env
# Base de datos
USE_SQLITE=true
DB_PATH=./database.sqlite

# Servidor
PORT=3000
NODE_ENV=production

# Seguridad
JWT_SECRET=LuisYSveinEstanDesarrollandoUnaAplicacion

# MySQL (legacy, no usado actualmente)
DB_HOST=localhost
DB_USER=ADMIN
DB_PASSWORD=0192837465
DB_NAME=JardinBotanico
DB_PORT=3306
```

### Despliegue en Render (render.yaml)
```yaml
services:
  - type: web
    name: jardin-botanico-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd app && npm install
    startCommand: cd app && npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: JWT_SECRET
        value: LuisYSveinEstanDesarrollandoUnaAplicacion
      - key: NODE_ENV
        value: production
```

---

## 16. CASOS DE USO PRINCIPALES

### CU-01: Usuario consulta catálogo
1. Usuario accede a `/`
2. Sistema muestra listado de plantas
3. Usuario escribe en búsqueda
4. Sistema filtra en tiempo real
5. Usuario selecciona planta
6. Sistema muestra modal con detalle

---

### CU-02: Usuario envía solicitud de donación
1. Usuario se registra/login
2. Usuario accede a formulario donación
3. Usuario completa: nombre, descripción, ubicación, motivo
4. Sistema valida datos
5. Sistema crea solicitud con estado "pendiente"
6. Sistema muestra confirmación

---

### CU-03: Admin gestiona solicitud
1. Admin inicia sesión
2. Admin accede a `/administracion/admin?vista=solicitudes`
3. Sistema muestra todas las solicitudes
4. Admin selecciona una solicitud
5. Admin cambia estado y agrega respuesta
6. Sistema actualiza solicitud
7. Usuario ve respuesta en "Mis Solicitudes"

---

### CU-04: Admin agrega planta al catálogo
1. Admin inicia sesión
2. Admin accede a panel de plantas
3. Admin completa formulario + sube imagen
4. Sistema valida imagen (formato, tamaño)
5. Sistema guarda imagen en servidor
6. Sistema crea registro en BD
7. Planta visible en catálogo público

---

### CU-05: Admin registra planta física (PLANIFICADO)
1. Admin selecciona especie (PlantaInfo)
2. Admin completa: fecha siembra, nombre propio
3. Sistema crea PlantaFisica con estado "Sana"
4. Admin puede asignar cuidados periódicos

---

### CU-06: Admin crea remedio (PLANIFICADO)
1. Admin selecciona PlantaFisica
2. Admin completa: descripción, usos, efectividad
3. Admin indica si requiere médico
4. Admin agrega pasos de preparación (1, 2, 3...)
5. Sistema guarda remedio con pasos
6. Remedio visible en perfil de planta

---

### CU-07: Sistema genera notificación automática (PLANIFICADO)
1. Sistema detecta evento (ej: cuidado retrasado)
2. Sistema crea notificación automática
3. Sistema marca como "Obligatoria" si es crítico
4. Admin ve notificación en dashboard
5. Admin acepta/rechaza notificación
6. Sistema registra hora de aceptación

---

## 17. HISTORIAL DE VERSIONES

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2024 | Luis & Svein | Requerimientos iniciales (implementación actual) |
| 2.0 | 2025-12-13 | Documentación extendida | Integración con diagrama UML, endpoints planificados, modelo completo |

---

## 18. REFERENCIAS

- **Diagrama UML:** `diagrama_clases_app_plantas_botanicas.uxf`
- **Notas de desarrollo:** `notas_08-11-25.txt`
- **Implementación actual:** `/app/src/`
- **Configuración:** `render.yaml`, `.env`
- **Base de datos:** `/app/database.sqlite`

---

## 19. ROADMAP DE DESARROLLO

### Sprint 1 - COMPLETADO ✅
- [x] Autenticación y autorización
- [x] CRUD usuarios
- [x] CRUD plantas (simplificado)
- [x] Sistema de solicitudes/donaciones
- [x] Panel administrativo básico
- [x] API REST funcional

### Sprint 2 - PLANIFICADO ⏳
**Objetivo:** Separación de datos científicos y físicos
- [ ] Migrar tabla `plantas` a `PlantaInfo`
- [ ] Crear tabla `PlantaFisica`
- [ ] Implementar endpoints PlantaInfo
- [ ] Implementar endpoints PlantaFisica
- [ ] Actualizar modelo de Donaciones

### Sprint 3 - PLANIFICADO ⏳
**Objetivo:** Remedios medicinales
- [ ] Crear tabla `Remedio`
- [ ] Crear tabla `Paso`
- [ ] Implementar CRUD Remedios
- [ ] Implementar gestión de Pasos
- [ ] Interfaz de visualización de remedios

### Sprint 4 - PLANIFICADO ⏳
**Objetivo:** Sistema de cuidados
- [ ] Crear tabla `TipoCuidado`
- [ ] Crear tabla `Cuidado`
- [ ] Crear tabla `Horarios`
- [ ] Implementar asignación de cuidados
- [ ] Implementar programación de horarios
- [ ] Dashboard de cuidados pendientes

### Sprint 5 - PLANIFICADO ⏳
**Objetivo:** Notificaciones y enfermedades
- [ ] Crear tabla `Notificacion`
- [ ] Crear tabla `Enfermedad`
- [ ] Crear tabla `PlantaFisica_Enfermedad`
- [ ] Implementar notificaciones manuales
- [ ] Implementar notificaciones automáticas
- [ ] Catálogo de enfermedades
- [ ] Asociación plantas-enfermedades

---

**FIN DEL DOCUMENTO**

---

**Elaborado por:** Luis & Svein
**Para:** Sistema de Gestión del Jardín Botánico de Plantas Medicinales UJAT
**Versión:** 2.0
**Fecha:** 13 de Diciembre de 2025
