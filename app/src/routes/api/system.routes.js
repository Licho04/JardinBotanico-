import express from 'express';
import db from '../../config/database.js';
import { verificarToken, verificarAdmin } from '../../controllers/auth.controller.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ruta de imágenes (misma lógica que server.js y plantas.controller.js)
const imagesPath = process.env.IMAGES_PATH ||
    (process.env.DATA_PATH ? path.join(process.env.DATA_PATH, 'imagenes') : null) ||
    path.join(__dirname, '../../../../frontend/recursos/imagenes');

// Configuración de Multer para subir base de datos
const storageDB = multer.diskStorage({
    destination: (req, file, cb) => {
        const dbDir = path.dirname(db.filename);
        cb(null, dbDir);
    },
    filename: (req, file, cb) => {
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
 * Descargar respaldo completo: base de datos + imágenes en un ZIP
 */
router.get('/backup', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { default: archiver } = await import('archiver');
        const dbPath = db.filename;
        const date = new Date().toISOString().slice(0, 10);
        const filename = `respaldo_jardin_${date}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const archive = archiver('zip', { zlib: { level: 6 } });

        archive.on('error', (err) => {
            console.error('Error al generar ZIP de respaldo:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error al generar respaldo' });
            }
        });

        archive.pipe(res);

        archive.file(dbPath, { name: 'database.sqlite' });

        if (fs.existsSync(imagesPath)) {
            archive.directory(imagesPath, 'imagenes');
        }

        archive.finalize();

    } catch (error) {
        console.error('Error en ruta de respaldo:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

/**
 * POST /api/system/restore
 * Restaurar base de datos desde archivo .sqlite
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
            if (fs.existsSync(currentDBPath)) {
                fs.copyFileSync(currentDBPath, backupPath);
            }

            fs.copyFileSync(newDBPath, currentDBPath);
            fs.unlinkSync(newDBPath);

            res.json({ success: true, mensaje: 'Restauración exitosa. El servidor aplicará los cambios internamente.' });

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
