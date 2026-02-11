import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Habilitar modo verbose para debugging
const sqlite = sqlite3.verbose();

// Ruta de la base de datos SQLite
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Auto-migración para Render Disk
if (process.env.DATA_PATH) {
    const targetPath = path.join(process.env.DATA_PATH, 'database.sqlite');
    const sourcePath = path.join(__dirname, '../../database.sqlite'); // Archivo local en root/app/database.sqlite

    console.log('🔍 [DB DEBUG] DATA_PATH detectado:', process.env.DATA_PATH);
    console.log('🔍 [DB DEBUG] Target Path:', targetPath);
    console.log('🔍 [DB DEBUG] Source Path:', sourcePath);

    // Si no existe la BD en el disco persistente pero sí en el repo, copiarla
    const existeTarget = fs.existsSync(targetPath);
    const existeSource = fs.existsSync(sourcePath);

    console.log('🔍 [DB DEBUG] Existe Target?:', existeTarget);
    console.log('🔍 [DB DEBUG] Existe Source?:', existeSource);

    if (existeSource) {
        let realizarCopia = false;

        if (!existeTarget || true) { // <--- FORZAMOS LA COPIA
            console.log('📦 [FORCE UPDATE] Base de datos local sobrescribiendo producción...');
            realizarCopia = true;
        } else {
            console.log('✅ Base de datos existente detectada en disco persistente. No se necesita migración.');
        }

        if (realizarCopia) {
            try {
                // Asegurar que el directorio destino exista
                if (!fs.existsSync(process.env.DATA_PATH)) {
                    console.log(`📦 Creando directorio de datos: ${process.env.DATA_PATH}`);
                    fs.mkdirSync(process.env.DATA_PATH, { recursive: true });
                }

                fs.copyFileSync(sourcePath, targetPath);
                console.log('✅ Base de datos migrada/restaurada correctamente.');
            } catch (error) {
                console.error('❌ Error CRÍTICO al migrar base de datos:', error);
                // No matamos el proceso, dejamos que intente conectar con lo que haya o falle en conexión
            }
        }
    }

    DB_PATH = targetPath;
} else {
    console.log('⚠️ [DB DEBUG] DATA_PATH no está definido. Usando base de datos local (efímera en producción).');
}

// Crear conexión a la base de datos
const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos SQLite:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conexión exitosa a la base de datos SQLite');
    }
});

// Convertir métodos de callback a promesas con el contexto correcto
db.runAsync = function (...args) {
    return new Promise((resolve, reject) => {
        db.run(...args, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this); // 'this' contiene lastID, changes, etc.
            }
        });
    });
};

db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.execAsync = promisify(db.exec.bind(db));

// Habilitar foreign keys en SQLite
db.run('PRAGMA foreign_keys = ON;');

export default db;
