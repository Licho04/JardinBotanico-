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
                pi.genero,
                pi.fotos_crecimiento
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            ORDER BY pf.nombre_propio
        `;

        const plantas = await db.allAsync(query);

        // Procesar imágenes para la vista de lista
        // Si no hay imagen_path (porque lo quitamos), usar la ÚLTIMA de la galería
        plantas.forEach(p => {
            // Siempre intentamos sacar la foto de la galería si existe, para asegurar que sea la más reciente
            // O si p.imagen está vacía.
            if (!p.imagen || p.imagen === '' || p.fotos_crecimiento) {
                if (p.fotos_crecimiento) {
                    try {
                        const galeria = JSON.parse(p.fotos_crecimiento);
                        if (Array.isArray(galeria) && galeria.length > 0) {
                            // Flatten if objects (legacy) and Filter empty strings
                            const validImages = galeria
                                .map(g => (typeof g === 'object' && g.imagen_path) ? g.imagen_path : g)
                                .filter(img => typeof img === 'string' && img.trim().length > 0);

                            // Use the last VALID image
                            if (validImages.length > 0) {
                                p.imagen = validImages[validImages.length - 1];
                            }
                        }
                    } catch (e) {
                        // Ignorar error de parseo
                    }
                }
            }
        });

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

// Obtener una planta por ID (JOIN + Relaciones)
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
                pi.genero
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

        // Obtener relaciones
        // *REFACTOR*: Ahora pertenecen a Remedios, ya no a Planta.
        // Mantenemos los arrays vacíos o los eliminamos del response si el frontend lo soporta.
        // Para compatibilidad con view existente (si espera arrays), mandamos vacíos por ahora, 
        // pero la data real vendrá dentro de 'remedios'.
        planta.contraindicaciones = [];
        planta.efectos_secundarios = [];
        planta.usos = [];

        // Obtener Remedios con sus detalles completos
        const remedios = await db.allAsync("SELECT * FROM remedios WHERE nombre_cientifico = ?", [planta.nombre_cientifico]);

        // Popular detalles de cada remedio
        for (let r of remedios) {
            r.contraindicaciones = await db.allAsync("SELECT * FROM contraindicaciones WHERE id_remedio = ?", [r.id]);
            r.efectos_secundarios = await db.allAsync("SELECT * FROM efectos_secundarios WHERE id_remedio = ?", [r.id]);
            r.usos = await db.allAsync(`
                SELECT u.* FROM usos u 
                JOIN remedios_usos ru ON u.id = ru.id_uso 
                WHERE ru.id_remedio = ?`, [r.id]);
            r.pasos = await db.allAsync("SELECT * FROM pasos WHERE id_remedio = ?", [r.id]);
        }

        planta.remedios = remedios;

        // NORMALIZACIÓN DE GALERÍA (String Array)
        // Aseguramos que siempre sea ['foto1.jpg', 'foto2.jpg'] sin vacíos
        if (planta.fotos_crecimiento) {
            try {
                let parsed = JSON.parse(planta.fotos_crecimiento);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Si son objetos (Legacy), extraemos imagen_path
                    if (typeof parsed[0] === 'object' && parsed[0].imagen_path) {
                        parsed = parsed.map(f => f.imagen_path);
                    }
                    // Filtrar strings vacíos o nulos
                    parsed = parsed.filter(f => typeof f === 'string' && f.trim().length > 0);
                } else {
                    parsed = [];
                }
                planta.galeria = parsed;
            } catch (e) {
                planta.galeria = [];
            }
        } else {
            planta.galeria = [];
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

// Crear nueva planta (Transacción con Relaciones)
export const crearPlanta = async (req, res) => {
    try {
        const {
            nombre, // maps to nombres_comunes in planta_info AND nombre_propio in planta_fisica
            nombre_cientifico,
            descripcion,
            propiedades,
            principio_activo,
            genero,
            morfologia,
            zona_geografica, // maps to distribucion_geografica
            fecha_sembrada,
            situacion,
            bibliografia
        } = req.body;

        if (!nombre || !nombre_cientifico) {
            return res.status(400).json({
                error: 'Nombre común y Nombre Científico son requeridos'
            });
        }

        // Manejo de archivos (Solo Galería)
        const galeriaFotos = (req.files && req.files['galeria']) ? req.files['galeria'] : [];

        await db.run('BEGIN TRANSACTION');

        // 1. Insertar o Actualizar PlantaInfo Base
        // Serializar galería a JSON (Array de Objetos)
        // Serializar galería a JSON (Array de Strings)
        let fotosCrecimiento = [];

        if (galeriaFotos.length > 0) {
            fotosCrecimiento = galeriaFotos.map(f => f.filename).filter(f => f && f.trim().length > 0);
        }

        const fotosCrecimientoJSON = JSON.stringify(fotosCrecimiento);

        const infoQuery = `
            INSERT OR IGNORE INTO planta_info 
            (nombre_cientifico, descripcion, principio_activo, propiedades_curativas, nombres_comunes, bibliografia, fotos_crecimiento, genero, morfologia, distribucion_geografica)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.runAsync(infoQuery, [
            nombre_cientifico,
            descripcion || '',
            principio_activo || '',
            propiedades || '',
            nombre || '',
            bibliografia || '',
            fotosCrecimientoJSON,
            genero || '',
            morfologia || '',
            zona_geografica || ''
        ]);

        // 2, 3, 4. Relaciones movidas a Remedios

        // 5. Crear la Planta Fisica
        const fisicaQuery = `
            INSERT INTO planta_fisica
            (nombre_propio, fecha_sembrada, situacion, imagen_path, nombre_cientifico)
            VALUES (?, ?, ?, ?, ?)
        `;

        const resultado = await db.runAsync(fisicaQuery, [
            nombre,
            fecha_sembrada || new Date().toISOString().split('T')[0],
            situacion || 'Sana',
            '', // Imagen principal eliminada (vacía)
            nombre_cientifico
        ]);

        const idPlanta = resultado.lastID;

        // 6. Fotos de Galería ya se guardaron en PlantaInfo como JSON

        await db.run('COMMIT');

        res.status(201).json({
            success: true,
            mensaje: 'Planta creada correctamente',
            planta: {
                id: idPlanta,
                nombre,
                nombre_cientifico,
                imagen: ''
            }
        });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error al crear planta:', error);
        res.status(500).json({
            error: 'Error al crear planta',
            detalle: error.message
        });
    }
};

// Actualizar planta (Actualiza todo)
export const actualizarPlanta = async (req, res) => {
    try {
        const { id } = req.params; // ID de planta_fisica
        console.log('--- ACTUALIZAR PLANTA DEBUG ---');
        console.log('ID:', id);
        console.log('Body:', JSON.stringify(req.body, null, 2)); // Debug body
        console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
        const {
            nombre,
            nombre_cientifico,
            descripcion,
            propiedades,
            principio_activo,
            genero,
            morfologia,
            zona_geografica,
            fecha_sembrada,
            situacion,
            bibliografia
        } = req.body;

        const plantaFisica = await db.getAsync('SELECT * FROM planta_fisica WHERE id_planta = ?', [id]);
        if (!plantaFisica) return res.status(404).json({ error: 'Planta física no encontrada' });

        // Imagen principal ignorada/eliminada logicamente

        await db.run('BEGIN TRANSACTION');

        // 1. Actualizar Info Científica
        // Recuperar fotos existentes segun el orden enviado por el formulario
        let fotosExistentes = []; // Será Array de Strings

        // NORMALIZAR DB ACTUAL PRIMERO (para búsquedas si fuera necesario, aunque ahora solo recibimos strings del form)
        // En este caso, el formulario envía hidden inputs con el FILENAME directo.
        // Solo necesitamos confiar en el orden que envía el form.

        if (req.body.imagenes_orden) {
            // Si el formulario envió orden, usamos eso (maneja reordenamiento y borrado)
            // Express puede devolver un string si es solo uno, o array si son varios.
            const orden = Array.isArray(req.body.imagenes_orden) ? req.body.imagenes_orden : [req.body.imagenes_orden];
            // Filtrar vacíos
            fotosExistentes = orden.filter(f => f && typeof f === 'string' && f.trim().length > 0);
        } else {
            // Si no hay key 'imagenes_orden', significa que se borraron todas O que no había ninguna.
            fotosExistentes = [];
        }

        if (req.files && req.files['galeria']) {
            const nuevasFotos = req.files['galeria'].map(f => f.filename);
            fotosExistentes = [...fotosExistentes, ...nuevasFotos];
        }

        const fotosCrecimientoJSON = JSON.stringify(fotosExistentes);

        const updateInfoQuery = `
            INSERT INTO planta_info (nombre_cientifico, descripcion, propiedades_curativas, principio_activo, bibliografia, fotos_crecimiento, genero, morfologia, distribucion_geografica)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(nombre_cientifico) DO UPDATE SET
            descripcion=excluded.descripcion,
            propiedades_curativas=excluded.propiedades_curativas,
            principio_activo=excluded.principio_activo,
            bibliografia=excluded.bibliografia,
            fotos_crecimiento=excluded.fotos_crecimiento,
            genero=excluded.genero,
            morfologia=excluded.morfologia,
            distribucion_geografica=excluded.distribucion_geografica
        `;

        // Usamos el NUEVO nombre cientifico (o el mismo si no cambió)
        await db.runAsync(updateInfoQuery, [
            nombre_cientifico, // Nuevo nombre
            descripcion, propiedades, principio_activo,
            bibliografia, fotosCrecimientoJSON,
            genero || '', morfologia || '', zona_geografica || ''
        ]);

        // 2, 3. Relaciones movidas a Remedios

        // 4. Actualizar Planta Física (incluyendo cambio de FK nombre_cientifico)
        await db.runAsync(
            `UPDATE planta_fisica SET nombre_propio = ?, fecha_sembrada = ?, situacion = ?, nombre_cientifico = ? WHERE id_planta = ?`,
            [nombre, fecha_sembrada || plantaFisica.fecha_sembrada, situacion || plantaFisica.situacion, nombre_cientifico, id]
        );

        // 5. Fotos de galería ya actualizadas en PlantaInfo

        await db.run('COMMIT');

        res.json({ success: true, mensaje: 'Planta actualizada correctamente' });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error al actualizar planta:', error);
        res.status(500).json({ error: 'Error al actualizar planta', detalle: error.message });
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

        res.json({ success: true, mensaje: 'Planta eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({
            error: 'Error al eliminar planta',
            detalle: error.message
        });
    }
};
