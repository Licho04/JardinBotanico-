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

// Obtener una planta por NOMBRE CIENTIFICO
export const obtenerPlantaPorId = async (req, res) => {
    try {
        const { nombre_cientifico } = req.params;

        // Decodificar el nombre por si viene con %20
        const nombreDecoded = decodeURIComponent(nombre_cientifico);

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
            WHERE pi.nombre_cientifico = ?
        `;

        // Como puede haber varias plantas físicas de la misma especie,
        // tomamos la primera (o devolvemos todas si cambiáramos la lógica).
        // Por ahora, para mantener compatibilidad con "Ficha de Planta", devolvemos una.
        const planta = await db.getAsync(query, [nombreDecoded]);

        if (!planta) {
            return res.status(404).json({
                error: 'Planta no encontrada'
            });
        }

        planta.contraindicaciones = [];
        planta.efectos_secundarios = [];
        planta.usos = [];

        // Obtener Remedios con sus detalles completos usando el nombre científico directo
        const remedios = await db.allAsync("SELECT * FROM remedios WHERE nombre_cientifico = ?", [nombreDecoded]);

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
        // Recuperamos desde planta_info (join anterior)
        // Nota: planta.fotos_crecimiento viene del query inicial si lo seleccionamos?
        // Ah, en el query arriba falta seleccionar fotos_crecimiento de pi.
        // Vamos a hacer otro query rápido para asegurar o corregir el query inicial.

        // CORRECCIÓN: Agregar fotos_crecimiento al SELECT
        const info = await db.getAsync("SELECT fotos_crecimiento FROM planta_info WHERE nombre_cientifico = ?", [nombreDecoded]);

        if (info && info.fotos_crecimiento) {
            try {
                let parsed = JSON.parse(info.fotos_crecimiento);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    if (typeof parsed[0] === 'object' && parsed[0].imagen_path) {
                        parsed = parsed.map(f => f.imagen_path);
                    }
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

// Actualizar planta (Actualiza todo por nombre científico)
export const actualizarPlanta = async (req, res) => {
    try {
        const { nombre_cientifico } = req.params; // Viene de la URL
        const nombreDecoded = decodeURIComponent(nombre_cientifico);

        console.log('--- ACTUALIZAR PLANTA DEBUG ---');
        console.log('Target Científico:', nombreDecoded);

        // Para mantener compatibilidad con el form que envía datos mixtos,
        // necesitamos saber qué planta física actualizar si hay varias.
        // Pero idealmente actualizamos la INFORMACIÓN CIENTÍFICA (que es única)
        // y la PLANTA FÍSICA asociada (o la primera que encontremos).

        // En este refactor, asumimos que se actualiza la INFO general.

        /* 
           NOTA IMPORTANTE: 
           Como la UI de admin envía el ID oculto del registro físico, 
           podríamos usar ese ID del body para actualizar la tabla física,
           y usar el nombre_cientifico del URL para la tabla info.
        */
        const idFisico = req.body.id_planta || req.body.id; // Intentar obtener ID si viene en body

        // Recuperar datos del body
        const {
            nombre,
            // nombre_cientifico (del body puede ser nuevo si lo cambiaron)
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

        const nuevoNombreCientifico = req.body.nombre_cientifico || nombreDecoded;

        await db.run('BEGIN TRANSACTION');

        // 1. Actualizar Info Científica
        let fotosExistentes = [];

        if (req.body.imagenes_orden) {
            const orden = Array.isArray(req.body.imagenes_orden) ? req.body.imagenes_orden : [req.body.imagenes_orden];
            fotosExistentes = orden.filter(f => f && typeof f === 'string' && f.trim().length > 0);
        } else {
            fotosExistentes = [];
        }

        if (req.files && req.files['galeria']) {
            const nuevasFotos = req.files['galeria'].map(f => f.filename);
            fotosExistentes = [...fotosExistentes, ...nuevasFotos];
        }

        const fotosCrecimientoJSON = JSON.stringify(fotosExistentes);

        // Si cambia el nombre científico, necesitamos actualizar la PK en planta_info primero?
        // No, SQLite no soporta CASCADE UPDATE en PKs text facilmente si no está configurado.
        // Mejor estrategia: Si cambia nombre, Crear Nuevo Info -> Mover Referencias -> Borrar Viejo.
        // PERO simplifiquemos: Asumimos Update in Place de los campos, y si cambian el nombre,
        // actualizamos el registro existente.

        const updateInfoQuery = `
            UPDATE planta_info SET
                nombre_cientifico = ?,
                descripcion = ?,
                propiedades_curativas = ?,
                principio_activo = ?,
                bibliografia = ?,
                fotos_crecimiento = ?,
                genero = ?,
                morfologia = ?,
                distribucion_geografica = ?
            WHERE nombre_cientifico = ?
        `;

        await db.runAsync(updateInfoQuery, [
            nuevoNombreCientifico,
            descripcion, propiedades, principio_activo,
            bibliografia, fotosCrecimientoJSON,
            genero || '', morfologia || '', zona_geografica || '',
            nombreDecoded // WHERE el viejo nombre
        ]);

        // 2. Actualizar referencias en Planta Física
        // Si tenemos ID físico, actualizamos ese específico. Si no, actualizamos todos los que tengan ese nombre.
        if (idFisico) {
            await db.runAsync(
                `UPDATE planta_fisica SET nombre_propio = ?, fecha_sembrada = ?, situacion = ?, nombre_cientifico = ? WHERE id_planta = ?`,
                [nombre, fecha_sembrada, situacion, nuevoNombreCientifico, idFisico]
            );
        } else {
            // Fallback: Actualizar todos (Riesgoso si hay multiples, pero coherente con cambio de especie)
            await db.runAsync(
                `UPDATE planta_fisica SET nombre_propio = ?, fecha_sembrada = ?, situacion = ?, nombre_cientifico = ? WHERE nombre_cientifico = ?`,
                [nombre, fecha_sembrada, situacion, nuevoNombreCientifico, nombreDecoded]
            );
        }

        // 3. Actualizar FK en Remedios si cambió el nombre
        if (nuevoNombreCientifico !== nombreDecoded) {
            await db.runAsync('UPDATE remedios SET nombre_cientifico = ? WHERE nombre_cientifico = ?', [nuevoNombreCientifico, nombreDecoded]);
        }

        await db.run('COMMIT');

        res.json({ success: true, mensaje: 'Planta actualizada correctamente' });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error al actualizar planta:', error);
        res.status(500).json({ error: 'Error al actualizar planta', detalle: error.message });
    }
};

// Eliminar planta (Por nombre científico)
export const eliminarPlanta = async (req, res) => {
    try {
        const { nombre_cientifico } = req.params;
        const nombreDecoded = decodeURIComponent(nombre_cientifico);

        // Eliminar Info Científica (Cascade lógico)
        // Primero borrar físicas
        const plantasFisicas = await db.allAsync('SELECT * FROM planta_fisica WHERE nombre_cientifico = ?', [nombreDecoded]);

        for (let p of plantasFisicas) {
            // Eliminar imagen física si existiera (legacy)
            if (p.imagen_path) {
                let rutaImagen = path.join(__dirname, '../../../recursos/imagenes', p.imagen_path);
                if (process.env.DATA_PATH) rutaImagen = path.join(process.env.DATA_PATH, 'imagenes', p.imagen_path);
                if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
            }
        }

        await db.runAsync('DELETE FROM planta_fisica WHERE nombre_cientifico = ?', [nombreDecoded]);
        await db.runAsync('DELETE FROM planta_info WHERE nombre_cientifico = ?', [nombreDecoded]);
        // Remedios también deberían borrarse o quedar huérfanos? Mejor borrarlos.
        await db.runAsync('DELETE FROM remedios WHERE nombre_cientifico = ?', [nombreDecoded]);

        res.json({ success: true, mensaje: 'Planta y toda su información eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({
            error: 'Error al eliminar planta',
            detalle: error.message
        });
    }
};
