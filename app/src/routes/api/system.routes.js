import express from 'express';
import db from '../../config/database.js';
import { verificarToken, verificarAdmin } from '../../controllers/auth.controller.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configuración de Multer para subir base de datos
const storageDB = multer.diskStorage({
    destination: (req, file, cb) => {
        // Usar la misma ubicación que la base de datos actual
        const dbDir = path.dirname(db.filename);
        cb(null, dbDir);
    },
    filename: (req, file, cb) => {
        // Nombre temporal
        cb(null, 'database_restore.sqlite');
    }
});

const uploadDB = multer({
    storage: storageDB,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/x-sqlite3' || file.originalname.endsWith('.sqlite')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos .sqlite'));
        }
    }
});

/**
 * GET /api/system/backup
 * Descargar respaldo de base de datos
 */
router.get('/backup', verificarToken, verificarAdmin, (req, res) => {
    try {
        const dbPath = db.filename;
        const date = new Date().toISOString().slice(0, 10);
        res.download(dbPath, `respaldo_jardin_${date}.sqlite`, (err) => {
            if (err) {
                console.error('Error al descargar base de datos:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error al generar respaldo' });
                }
            }
        });
    } catch (error) {
        console.error('Error en ruta de respaldo:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

/**
 * POST /api/system/restore
 * Restaurar base de datos
 */
router.post('/restore', verificarToken, verificarAdmin, uploadDB.single('backup_file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        const currentDBPath = db.filename;
        const newDBPath = req.file.path;
        const backupPath = currentDBPath + '.bak';

        try {
            // Backup actual
            if (fs.existsSync(currentDBPath)) {
                fs.copyFileSync(currentDBPath, backupPath);
            }

            // Sobrescribir
            fs.copyFileSync(newDBPath, currentDBPath);

            // Borrar temporal
            fs.unlinkSync(newDBPath);

            res.json({ success: true, mensaje: 'Restauración Exitosa. El servidor aplicará los cambios internamente.' });

            // Forzar reinicio para liberar handlers de SQLite
            setTimeout(() => {
                process.exit(0);
            }, 1000);

        } catch (err) {
            console.error('Error al reemplazar archivo:', err);
            res.status(500).json({ error: `Error al reemplazar base de datos: ${err.message}` });
        }

    } catch (error) {
        console.error('Error en restauración:', error);
        res.status(500).json({ error: 'Error interno en restauración' });
    }
});

export default router;
