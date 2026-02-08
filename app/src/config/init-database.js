import db from './database.js';

const initDatabase = () => {
    // --- ESQUEMA DEFINITIVO (UML 100%) ---

    // 1. PlantaInfo (Taxonomía y Ciencia)
    const crearTablaPlantaInfo = `
        CREATE TABLE IF NOT EXISTS planta_info (
            nombre_cientifico TEXT PRIMARY KEY,
            genero TEXT,
            descripcion TEXT,
            principio_activo TEXT,
            propiedades_curativas TEXT,
            nombres_comunes TEXT,
            morfologia TEXT,
            bibliografia TEXT,
            distribucion_geografica TEXT
        )
    `;

    // 2. PlantaFisica (Inventario)
    const crearTablaPlantaFisica = `
        CREATE TABLE IF NOT EXISTS planta_fisica (
            id_planta INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_propio TEXT,
            fecha_sembrada TEXT,
            situacion TEXT, -- 'Sana', 'Enferma', etc.
            imagen_path TEXT,
            nombre_cientifico TEXT, -- FK a planta_info
            FOREIGN KEY (nombre_cientifico) REFERENCES planta_info(nombre_cientifico)
        )
    `;

    // 3. Distribucion (Tabla separada según diagrama)
    const crearTablaDistribucion = `
        CREATE TABLE IF NOT EXISTS distribucion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            distribucion TEXT,
            nombre_cientifico TEXT,
            FOREIGN KEY (nombre_cientifico) REFERENCES planta_info(nombre_cientifico)
        )
    `;

    // 4. Usuarios (Nuevo esquema)
    const crearTablaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            correo TEXT PRIMARY KEY,
            usuario TEXT UNIQUE, -- Username (legacy y compatibilidad)
            password TEXT NOT NULL,
            nombre TEXT,
            tipo TEXT -- 'admin', 'usuario'
        )
    `;

    // 5. Donaciones (Reemplaza solicitudes)
    const crearTablaDonaciones = `
        CREATE TABLE IF NOT EXISTS donaciones (
            id_donacion INTEGER PRIMARY KEY AUTOINCREMENT,
            detalles TEXT,
            motivo TEXT,
            fecha_donacion TEXT,
            fecha_aceptada TEXT,
            estado TEXT, -- 'Aceptada', 'Rechazada', 'En proceso'
            correo_usuario TEXT,
            FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo)
        )
    `;

    // Ejecutar la creación de tablas
    db.serialize(() => {
        const checkAndCreate = (tableName, createQuery, finalCallback) => {
            db.run(createQuery, (err) => {
                if (err) {
                    console.error(`Error al crear tabla ${tableName}:`, err.message);
                } else {
                    console.log(`✅ Tabla ${tableName} verificada`);
                }
                if (finalCallback) finalCallback();
            });
        };

        checkAndCreate('planta_info', crearTablaPlantaInfo);
        checkAndCreate('planta_fisica', crearTablaPlantaFisica);
        checkAndCreate('distribucion', crearTablaDistribucion);
        checkAndCreate('usuarios', crearTablaUsuarios, () => {
            // Sembrado de Admin
            db.get("SELECT count(*) as count FROM usuarios", async (err, row) => {
                if (!err && row.count === 0) {
                    console.log("⚠️ Creando administrador por defecto...");
                    try {
                        const bcrypt = await import('bcrypt');
                        const hash = await bcrypt.default.hash('admin123', 10);
                        // FIXED: Added 'usuario' column and value 'admin'
                        const insertAdmin = `INSERT INTO usuarios (correo, usuario, password, nombre, tipo) VALUES (?, ?, ?, ?, ?)`;
                        db.run(insertAdmin, ['admin@jardin.com', 'admin', hash, 'Administrador', 'admin']);
                    } catch (e) {
                        console.error("Error seeding admin:", e);
                    }
                }
            });
        });
        checkAndCreate('donaciones', crearTablaDonaciones);
    });
};

initDatabase();

export default initDatabase;
