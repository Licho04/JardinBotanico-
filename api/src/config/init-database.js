import db from './database.js';

const initDatabase = () => {
    // Crear tabla de usuarios
    const crearTablaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            usuario TEXT PRIMARY KEY,
            nombre TEXT,
            mail TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            tipo INTEGER DEFAULT 0
        )
    `;

    // Crear tabla de plantas
    const crearTablaPlantas = `
        CREATE TABLE IF NOT EXISTS plantas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            imagen TEXT,
            propiedades TEXT,
            nombre_cientifico TEXT,
            zona_geografica TEXT,
            usos TEXT
        )
    `;

    // Crear tabla de solicitudes_donacion
    const crearTablaSolicitudes = `
        CREATE TABLE IF NOT EXISTS solicitudes_donacion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            nombre_planta TEXT NOT NULL,
            descripcion_planta TEXT NOT NULL,
            propiedades_medicinales TEXT,
            ubicacion TEXT NOT NULL,
            motivo_donacion TEXT,
            fecha_solicitud TEXT NOT NULL,
            estatus TEXT NOT NULL DEFAULT 'Pendiente',
            comentarios TEXT,
            FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
        )
    `;

    // Ejecutar la creación de tablas
    db.serialize(() => {
        db.run(crearTablaUsuarios, (err) => {
            if (err) {
                console.error('Error al crear tabla usuarios:', err.message);
            } else {
                console.log('✅ Tabla usuarios creada o ya existe');
            }
        });

        db.run(crearTablaPlantas, (err) => {
            if (err) {
                console.error('Error al crear tabla plantas:', err.message);
            } else {
                console.log('✅ Tabla plantas creada o ya existe');
            }
        });

        db.run(crearTablaSolicitudes, (err) => {
            if (err) {
                console.error('Error al crear tabla solicitudes_donacion:', err.message);
            } else {
                console.log('✅ Tabla solicitudes_donacion creada o ya existe');
            }
        });
    });
};

// Ejecutar la inicialización
initDatabase();

export default initDatabase;
