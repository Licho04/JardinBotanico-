# Jardín de Plantas Medicinales - Sistema de Gestión de Plantas Medicinales

## Descripción del Proyecto
Este proyecto es una aplicación web para la gestión y visualización interactiva de un Jardín de Plantas Medicinales. Permite a los visitantes explorar un catálogo de plantas, consultar sus propiedades curativas, aprender sobre remedios naturales y solicitar donaciones. Además, cuenta con un panel de administración completo para gestionar el inventario de plantas físicas, usuarios y el sistema de donaciones.

⚠️ **Nota de Arquitectura:** Actualmente, el proyecto está construido bajo una **arquitectura monolítica** (el frontend y el backend viven en el mismo código base). Según la hoja de ruta del proyecto, **en el futuro esta estructura se separará** en dos proyectos distintos (Frontend independiente y API REST Backend) para mejorar su escalabilidad.

## Créditos
* **Diagrama de Clases y Estructura de Tablas:** Desarrollado por el estudiante **Angel Svein Ortiz Méndez**.
* **Desarrollo del Software (Frontend, Backend y Funcionalidad):** Desarrollado por el estudiante **Luis Enrique Madrigal Martínez**.

## Stack Tecnológico Utilizado
* **Backend:** Node.js, Express.js
* **Frontend:** EJS (Embedded JavaScript templating), HTML5, CSS3 (diseño responsivo con Vanilla CSS), Vanilla JavaScript.
* **Base de Datos:** SQLite3
* **Seguridad y Autenticación:** JSON Web Tokens (JWT) y bcrypt (encriptación de contraseñas).
* **Gestión de Archivos:** Multer (usado para subir galerías fotográficas de las plantas y copias de seguridad de la base de datos).

## Resumen del Modelo de Datos (Plantas)
Para mantener la información organizada, el sistema divide a las plantas en dos conceptos principales dentro de la base de datos:

1. **Información Científica (`planta_info`):** Guarda la teoría y botánica universal de la especie.
   * `nombre_cientifico` *(Llave primaria)*
   * `genero`, `morfologia`, `distribucion_geografica`
   * `descripcion`, `principio_activo`, `propiedades_curativas`
   * `bibliografia`, `fotos_crecimiento` *(Galería visual)*

2. **Inventario Físico (`planta_fisica`):** Representa el espécimen real sembrado en la escuela/jardín.
   * `id_planta` *(Llave primaria)*
   * `nombre_propio` *(El nombre común con el que la conocemos)*
   * `fecha_sembrada`
   * `situacion` *(Estado de salud: Sana, Enferma, etc.)*
   * `imagen_path` *(Rutas de imágenes específicas del espécimen)*
   * `nombre_cientifico` *(Llave foránea que la conecta con toda su teoría)*

3. **Remedios Naturales (`remedios`):** Recetas y tratamientos derivados de las plantas.
   * `id` *(Llave primaria)*
   * `nombre`, `descripcion`
   * `parte` *(Parte de la planta usada: hoja, raíz, etc.)*
   * `formato` *(Infusión, pomada, etc.)*
   * `dosis_cantidad`, `dosis_unidad`, `tiempo_efectividad`
   * `checar_medico` *(Advertencia si requiere consulta profesional)*
   * Relacionado a detalle mediante tablas adicionales:
     * `pasos` *(Instrucciones paso a paso para prepararlo)*
     * `contraindicaciones` *(Cuándo no se debe usar)*
     * `efectos_secundarios` *(Posibles reacciones)*

4. **Catálogo de Usos (`usos` y `remedios_usos`):**
   * El sistema clasifica para qué sirve cada remedio (Digestivo, Piel, etc.) mediante una tabla de categorías maestras (`usos`) que se conecta con los remedios (`remedios_usos`).

5. **Usuarios (`usuarios`):**
   * `correo` *(Llave primaria)*
   * `usuario`, `password`, `nombre`
   * `tipo` *(Distingue entre el "admin" del sistema y los "usuarios" normales)*
   * `intentos_fallidos`, `bloqueado_hasta` *(Medidas de seguridad contra fuerza bruta)*

6. **Donaciones (`donaciones`):** Gestión de las plantas que los visitantes desean donar al jardín.
   * `id_donacion` *(Llave primaria)*
   * `fecha_donacion`, `fecha_aceptada`, `estado` *(En proceso, Aceptada, Rechazada)*
   * `correo_usuario` *(Llave foránea para saber quién hizo la donación)*
   * *Información sobre la planta a donar:* `nombre_comun`, `descripcion`, `propiedades_curativas`, `distribucion_geografica`, `detalles`, `motivo`, `motivo_donacion`.

7. **Distribución Independiente (`distribucion`):**
   * `id`, `distribucion`, `nombre_cientifico`. *(Tabla adicional para categorizaciones geográficas complejas)*.

## Guía de Instalación Local

Para correr este proyecto en tu propia computadora, sigue estos cortos pasos:

### Paso 1: Requisitos
Asegúrate de tener instalado **Node.js** en tu computadora. Puedes descargarlo desde [nodejs.org](https://nodejs.org/) (descarga la versión LTS).

### Paso 2: Preparar el proyecto
1. Descarga o clona esta carpeta en tu computadora.
2. Abre la terminal (o consola de comandos de tu editor, como VS Code) dentro de la carpeta principal del proyecto.
3. Muévete hacia la carpeta del servidor escribiendo:
   ```bash
   cd app
   ```

### Paso 3: Instalar e Iniciar
1. Instala las librerías necesarias con el gestor de paquetes (solo toma unos segundos):
   ```bash
   npm install
   ```
2. ¡Inicia el servidor!
   ```bash
   npm run start
   ```
3. Ve a tu navegador y entra a: **[http://localhost:3000](http://localhost:3000)**

*(La base de datos SQLite viene incluida y se sincronizará automáticamente la primera vez que se arranque el proyecto, así que no se necesita instalar MySQL ni Postgre).*

## Despliegue Actual (Producción)
El proyecto se encuentra en línea gracias a la plataforma **Render.com**. 
Al ser un Web Service sin almacenamiento permanente en su plan básico, se ha implementado un Disco Persistente (`/var/data`) para asegurar que la base de datos (`database.sqlite`) y las imágenes subidas no se borren cuando el servidor se reinicia con cada actualización. 
Desde el panel de administración, el sistema cuenta con herramientas especializadas para descargar respaldos de la base de datos y subir (restaurar) un archivo `.sqlite` actualizado directamente al entorno de producción en la nube.
