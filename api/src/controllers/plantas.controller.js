import db from '../config/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../recursos/imagenes');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp, avif)'));
        }
    }
});

// Obtener todas las plantas
export const obtenerPlantas = async (req, res) => {
    try {
        const [plantas] = await db.query('SELECT * FROM plantas ORDER BY nombre');

        res.json({
            total: plantas.length,
            plantas
        });
    } catch (error) {
        console.error('Error al obtener plantas:', error);
        res.status(500).json({
            error: 'Error al obtener plantas',
            detalle: error.message
        });
    }
};

// Obtener una planta por ID
export const obtenerPlantaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [plantas] = await db.query('SELECT * FROM plantas WHERE id = ?', [id]);

        if (plantas.length === 0) {
            return res.status(404).json({
                error: 'Planta no encontrada'
            });
        }

        res.json(plantas[0]);
    } catch (error) {
        console.error('Error al obtener planta:', error);
        res.status(500).json({
            error: 'Error al obtener planta',
            detalle: error.message
        });
    }
};

// Crear nueva planta
export const crearPlanta = async (req, res) => {
    try {
        const {
            nombre,
            nombre_cientifico,
            descripcion,
            propiedades,
            zona_geografica,
            usos
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !descripcion) {
            return res.status(400).json({
                error: 'Nombre y descripción son requeridos'
            });
        }

        const imagen = req.file ? req.file.filename : '';

        const [resultado] = await db.query(
            `INSERT INTO plantas
            (nombre, descripcion, imagen, propiedades, nombre_cientifico, zona_geografica, usos)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, descripcion, imagen, propiedades || '', nombre_cientifico || '', zona_geografica || '', usos || '']
        );

        res.status(201).json({
            mensaje: 'Planta creada correctamente',
            planta: {
                id: resultado.insertId,
                nombre,
                descripcion,
                imagen,
                propiedades,
                nombre_cientifico,
                zona_geografica,
                usos
            }
        });

    } catch (error) {
        console.error('Error al crear planta:', error);
        res.status(500).json({
            error: 'Error al crear planta',
            detalle: error.message
        });
    }
};

// Actualizar planta
export const actualizarPlanta = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            nombre_cientifico,
            descripcion,
            propiedades,
            zona_geografica,
            usos
        } = req.body;

        // Verificar si la planta existe
        const [plantaExistente] = await db.query('SELECT * FROM plantas WHERE id = ?', [id]);

        if (plantaExistente.length === 0) {
            return res.status(404).json({
                error: 'Planta no encontrada'
            });
        }

        // Si hay nueva imagen, usar esa; si no, mantener la anterior
        const imagen = req.file ? req.file.filename : plantaExistente[0].imagen;

        // Si hay nueva imagen y existía una anterior, eliminar la anterior
        if (req.file && plantaExistente[0].imagen) {
            const rutaImagenAnterior = path.join(__dirname, '../../../recursos/imagenes', plantaExistente[0].imagen);
            if (fs.existsSync(rutaImagenAnterior)) {
                fs.unlinkSync(rutaImagenAnterior);
            }
        }

        await db.query(
            `UPDATE plantas SET
            nombre = ?,
            descripcion = ?,
            imagen = ?,
            propiedades = ?,
            nombre_cientifico = ?,
            zona_geografica = ?,
            usos = ?
            WHERE id = ?`,
            [nombre, descripcion, imagen, propiedades, nombre_cientifico, zona_geografica, usos, id]
        );

        res.json({
            mensaje: 'Planta actualizada correctamente',
            planta: {
                id,
                nombre,
                descripcion,
                imagen,
                propiedades,
                nombre_cientifico,
                zona_geografica,
                usos
            }
        });

    } catch (error) {
        console.error('Error al actualizar planta:', error);
        res.status(500).json({
            error: 'Error al actualizar planta',
            detalle: error.message
        });
    }
};

// Eliminar planta
export const eliminarPlanta = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la planta existe
        const [planta] = await db.query('SELECT * FROM plantas WHERE id = ?', [id]);

        if (planta.length === 0) {
            return res.status(404).json({
                error: 'Planta no encontrada'
            });
        }

        // Eliminar imagen si existe
        if (planta[0].imagen) {
            const rutaImagen = path.join(__dirname, '../../../recursos/imagenes', planta[0].imagen);
            if (fs.existsSync(rutaImagen)) {
                fs.unlinkSync(rutaImagen);
            }
        }

        await db.query('DELETE FROM plantas WHERE id = ?', [id]);

        res.json({
            mensaje: 'Planta eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({
            error: 'Error al eliminar planta',
            detalle: error.message
        });
    }
};
