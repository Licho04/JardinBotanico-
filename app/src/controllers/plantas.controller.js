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
        let uploadPath;
        if (process.env.DATA_PATH) {
            // En Producción (Render Disk)
            uploadPath = path.join(process.env.DATA_PATH, 'imagenes');
        } else {
            // En Desarrollo
            uploadPath = path.join(__dirname, '../../../recursos/imagenes');
        }

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
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
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

/**
 * --- REFACTORIZACIÓN FASE 4: ESQUEMA DUAL ---
 * Ahora leemos de 'planta_fisica' unida con 'planta_info'
 */

// Obtener todas las plantas (JOIN planta_fisica + planta_info)
export const obtenerPlantas = async (req, res) => {
    try {
        const query = `
            SELECT 
                pf.id_planta as id,
                pf.nombre_propio as nombre,
                pf.imagen_path as imagen,
                pf.fecha_sembrada,
                pf.situacion,
                pi.nombre_cientifico,
                pi.descripcion,
                pi.principio_activo,
                pi.propiedades_curativas as propiedades,
                pi.nombres_comunes,
                pi.morfologia,
                pi.bibliografia,
                pi.genero
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            ORDER BY pf.nombre_propio
        `;

        const plantas = await db.allAsync(query);

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

// Obtener una planta por ID (JOIN)
export const obtenerPlantaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                pf.id_planta as id,
                pf.nombre_propio as nombre,
                pf.imagen_path as imagen,
                pf.fecha_sembrada,
                pf.situacion,
                pi.nombre_cientifico,
                pi.descripcion,
                pi.principio_activo,
                pi.propiedades_curativas as propiedades,
                pi.nombres_comunes,
                pi.morfologia,
                pi.bibliografia,
                pi.genero,
                pi.parte_utilizada,
                pi.dosis,
                pi.contraindicaciones,
                pi.efectos_secundarios,
                pi.formas_farmaceuticas
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            WHERE pf.id_planta = ?
        `;

        const planta = await db.getAsync(query, [id]);

        if (!planta) {
            return res.status(404).json({
                error: 'Planta no encontrada'
            });
        }

        res.json(planta);
    } catch (error) {
        console.error('Error al obtener planta:', error);
        res.status(500).json({
            error: 'Error al obtener planta',
            detalle: error.message
        });
    }
};

// Crear nueva planta (Transacción Implícita: Info -> Fisica)
export const crearPlanta = async (req, res) => {
    try {
        const {
            nombre, // Será nombre_propio
            nombre_cientifico,
            descripcion,
            propiedades,
            zona_geografica, // TODO: Ver dónde guardar esto en el nuevo modelo (quizás morfología)
            usos, // TODO: Tabla aparte 'usos' (pendiente)
            principio_activo,
            parte_utilizada,
            dosis,
            contraindicaciones,
            efectos_secundarios,
            formas_farmaceuticas,
            fecha_sembrada,
            situacion
        } = req.body;

        if (!nombre || !nombre_cientifico) {
            return res.status(400).json({
                error: 'Nombre común y Nombre Científico son requeridos'
            });
        }

        const imagen = req.file ? req.file.filename : '';

        // 1. Insertar o Actualizar PlantaInfo (Upsert simple)
        // Si ya existe la info científica, no duplicamos, solo nos aseguramos que esté ahí.
        const infoQuery = `
            INSERT OR IGNORE INTO planta_info 
            (nombre_cientifico, descripcion, principio_activo, propiedades_curativas, nombres_comunes, parte_utilizada, dosis, contraindicaciones, efectos_secundarios, formas_farmaceuticas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.runAsync(infoQuery, [
            nombre_cientifico,
            descripcion || '',
            principio_activo || '',
            propiedades || '',
            nombre || '', // Se usa como nombre común base
            parte_utilizada || '',
            dosis || '',
            contraindicaciones || '',
            efectos_secundarios || '',
            formas_farmaceuticas || ''
        ]);

        // 2. Crear la Planta Fisica (Inventario)
        const fisicaQuery = `
            INSERT INTO planta_fisica
            (nombre_propio, fecha_sembrada, situacion, imagen_path, nombre_cientifico)
            VALUES (?, ?, ?, ?, ?)
        `;

        const resultado = await db.runAsync(fisicaQuery, [
            nombre,
            fecha_sembrada || new Date().toISOString().split('T')[0], // Default hoy
            situacion || 'Sana',
            imagen,
            nombre_cientifico
        ]);

        res.status(201).json({
            mensaje: 'Planta creada correctamente',
            planta: {
                id: resultado.lastID, // ID del inventario físico
                nombre,
                nombre_cientifico,
                imagen
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

// Actualizar planta (Actualiza ambas tablas)
export const actualizarPlanta = async (req, res) => {
    try {
        const { id } = req.params; // ID de planta_fisica
        const {
            nombre,
            nombre_cientifico,
            descripcion,
            propiedades,
            principio_activo,
            parte_utilizada,
            dosis,
            contraindicaciones,
            efectos_secundarios,
            formas_farmaceuticas,
            fecha_sembrada,
            situacion
        } = req.body;

        // Verificar si existe la planta física
        const plantaFisica = await db.getAsync('SELECT * FROM planta_fisica WHERE id_planta = ?', [id]);

        if (!plantaFisica) {
            return res.status(404).json({ error: 'Planta fÃ­sica no encontrada' });
        }

        const imagen = req.file ? req.file.filename : plantaFisica.imagen_path;

        // Gestión de imagen antigua
        if (req.file && plantaFisica.imagen_path) {
            let rutaImagenAnterior;
            if (process.env.DATA_PATH) {
                rutaImagenAnterior = path.join(process.env.DATA_PATH, 'imagenes', plantaFisica.imagen_path);
            } else {
                rutaImagenAnterior = path.join(__dirname, '../../../recursos/imagenes', plantaFisica.imagen_path);
            }
            if (fs.existsSync(rutaImagenAnterior)) fs.unlinkSync(rutaImagenAnterior);
        }

        // 1. Actualizar Info Científica (Si cambió algo)
        // NOTA: Esto afectará a TODAS las plantas fisicas de esta especie. Es el comportamiento adecuado para una relación 1:N.
        const updateInfoQuery = `
            UPDATE planta_info SET
            descripcion = ?, propiedades_curativas = ?, principio_activo = ?,
            parte_utilizada = ?, dosis = ?, contraindicaciones = ?, efectos_secundarios = ?, formas_farmaceuticas = ?
            WHERE nombre_cientifico = ?
        `;

        await db.runAsync(updateInfoQuery, [
            descripcion, propiedades, principio_activo,
            parte_utilizada, dosis, contraindicaciones, efectos_secundarios, formas_farmaceuticas,
            plantaFisica.nombre_cientifico // Usamos el nombre científico original para encontrar el registro
        ]);

        // 2. Actualizar Planta Física
        const updateFisicaQuery = `
            UPDATE planta_fisica SET
            nombre_propio = ?, fecha_sembrada = ?, situacion = ?, imagen_path = ?
            WHERE id_planta = ?
        `;

        await db.runAsync(updateFisicaQuery, [
            nombre,
            fecha_sembrada || plantaFisica.fecha_sembrada,
            situacion || plantaFisica.situacion,
            imagen,
            id
        ]);

        res.json({
            mensaje: 'Planta actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar planta:', error);
        res.status(500).json({
            error: 'Error al actualizar planta',
            detalle: error.message
        });
    }
};

// Eliminar planta (Solo elimina inventario físico)
export const eliminarPlanta = async (req, res) => {
    try {
        const { id } = req.params;

        const planta = await db.getAsync('SELECT * FROM planta_fisica WHERE id_planta = ?', [id]);

        if (!planta) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        // Eliminar imagen
        if (planta.imagen_path) {
            let rutaImagen;
            if (process.env.DATA_PATH) {
                rutaImagen = path.join(process.env.DATA_PATH, 'imagenes', planta.imagen_path);
            } else {
                rutaImagen = path.join(__dirname, '../../../recursos/imagenes', planta.imagen_path);
            }
            if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
        }

        await db.runAsync('DELETE FROM planta_fisica WHERE id_planta = ?', [id]);

        // Opcional: Podríamos verificar si quedan plantas de ese nombre_cientifico y borrar planta_info si count=0.
        // Por ahora lo dejamos para preservar la info científica.

        res.json({ mensaje: 'Planta eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({
            error: 'Error al eliminar planta',
            detalle: error.message
        });
    }
};
