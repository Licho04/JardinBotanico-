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
            usos TEXT,
            principio_activo TEXT,
            parte_utilizada TEXT,
            dosis TEXT,
            contraindicaciones TEXT,
            efectos_secundarios TEXT,
            formas_farmaceuticas TEXT
        )
    `;

    // Crear tabla de solicitudes
    const crearTablaSolicitudes = `
        CREATE TABLE IF NOT EXISTS solicitudes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            nombre_planta TEXT NOT NULL,
            descripcion_planta TEXT NOT NULL,
            propiedades_medicinales TEXT,
            ubicacion TEXT NOT NULL,
            motivo_donacion TEXT,
            estado TEXT NOT NULL DEFAULT 'pendiente',
            fecha TEXT NOT NULL,
            respuesta TEXT,
            FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
        )
    `;

    // Ejecutar la creación de tablas y sembrado inicial
    db.serialize(() => {
        const checkAndCreate = (tableName, createQuery, finalCallback) => {
            db.run(createQuery, (err) => {
                if (err) {
                    console.error(`Error al crear tabla ${tableName}:`, err.message);
                } else {
                    console.log(`✅ Tabla ${tableName} creada o ya existe`);
                }
                if (finalCallback) finalCallback();
            });
        };

        checkAndCreate('usuarios', crearTablaUsuarios, () => {
            // Verificar si hay usuarios
            db.get("SELECT count(*) as count FROM usuarios", async (err, row) => {
                if (err) {
                    console.error("Error al verificar usuarios:", err);
                    return;
                }

                if (row.count === 0) {
                    console.log("⚠️ No hay usuarios. Creando administrador por defecto...");
                    // Hash de 'admin123' usando bcrypt (import dinámico para no romper si no está instanciado arriba)
                    try {
                        const bcrypt = await import('bcrypt');
                        const hash = await bcrypt.default.hash('admin123', 10);

                        const insertAdmin = `
                            INSERT INTO usuarios (usuario, nombre, mail, password, tipo)
                            VALUES ('admin', 'Administrador', 'admin@jardin.com', ?, 1)
                        `;

                        db.run(insertAdmin, [hash], (err) => {
                            if (err) console.error("Error al crear admin:", err);
                            else console.log("✅ Usuario 'admin' creado con password 'admin123'");
                        });
                    } catch (e) {
                        console.error("Error al importar bcrypt para seeding:", e);
                    }
                }
            });
        });

        checkAndCreate('plantas', crearTablaPlantas, () => {
            // Migración: Agregar columnas nuevas si no existen (para bases de datos existentes)
            const columnasNuevas = [
                'principio_activo', 'parte_utilizada', 'dosis',
                'contraindicaciones', 'efectos_secundarios', 'formas_farmaceuticas'
            ];

            columnasNuevas.forEach(columna => {
                db.run(`ALTER TABLE plantas ADD COLUMN ${columna} TEXT`, (err) => {
                    // Ignorar error si la columna ya existe
                    if (!err) console.log(`✨ Columna agregada: ${columna}`);
                });
            });
        });
        checkAndCreate('solicitudes', crearTablaSolicitudes);
    });
};

// Ejecutar la inicialización
initDatabase();

export default initDatabase;
