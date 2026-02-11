import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../../config/database.js';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para agregar usuario a todas las vistas
router.use(optionalAuth);

// Ruta principal - Página de inicio
router.get('/', async (req, res) => {
    try {
        console.log(`🌍 [REQUEST] Access to / from IP: ${req.ip} | User: ${req.session?.usuario?.usuario || 'Guest'}`);

        // Obtener todas las plantas (Vista previa: nombre e imagen)
        // Obtener todas las plantas (Vista previa: nombre e imagen)
        const query = `
            SELECT 
                pf.nombre_propio as nombre, 
                pf.imagen_path as imagen,
                pi.nombre_cientifico,
                pi.fotos_crecimiento
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            ORDER BY pf.nombre_propio
        `;
        const plantas = await db.allAsync(query);

        // Procesar imágenes para la vista de lista (Igual que en controller)
        if (plantas) {
            plantas.forEach(p => {
                // Siempre intentamos sacar la foto de la galería si existe, para asegurar que sea la más reciente
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
        }

        res.render('index', {
            plantas: plantas || [],
            usuario: res.locals.usuario || null,
            isAuthenticated: res.locals.isAuthenticated
        });
    } catch (error) {
        console.error('Error al cargar plantas:', error);
        res.render('index', {
            plantas: [],
            usuario: res.locals.usuario || null,
            isAuthenticated: res.locals.isAuthenticated,
            error: 'Error al cargar las plantas'
        });
    }
});

// Ruta para obtener información de una planta (AJAX)
router.post('/plantas/info', async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'Nombre de planta requerido' });
        }

        // Intento 1: Buscar por Nombre Científico (Exacto)
        let query = `
            SELECT 
                pf.id_planta,
                pf.nombre_propio as nombre,
                pf.imagen_path as imagen,
                pi.*,
                d.distribucion as distribucion_extra
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            LEFT JOIN distribucion d ON pi.nombre_cientifico = d.nombre_cientifico
            WHERE pi.nombre_cientifico = ?
        `;

        let planta = await db.getAsync(query, [nombre]);

        // Intento 2: Buscar por Nombre Común (Legacy)
        if (!planta) {
            query = `
                SELECT 
                    pf.id_planta,
                    pf.nombre_propio as nombre,
                    pf.imagen_path as imagen,
                    pi.*,
                    d.distribucion as distribucion_extra
                FROM planta_fisica pf
                LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
                LEFT JOIN distribucion d ON pi.nombre_cientifico = d.nombre_cientifico
                WHERE pf.nombre_propio = ?
            `;
            planta = await db.getAsync(query, [nombre]);
        }

        if (!planta) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        // Mapeo de compatibilidad para la vista parcial (si usa campos viejos)
        // La vista info-planta usa: planta.nombre, planta.nombre_cientifico, planta.descripcion, 
        // planta.propiedades, planta.distribucion_geografica, etc.
        // planta_info tiene: descripcion, propiedades_curativas, distribucion_geografica.
        // Mapeamos lo necesario:
        // Mapeo de compatibilidad
        planta.propiedades = planta.propiedades_curativas;

        // Obtener relaciones para la vista detallada
        const nombreCientifico = planta.nombre_cientifico;

        if (nombreCientifico) {
            // Ya no obtenemos relaciones directas de planta (obsoletas)
            planta.contraindicaciones = [];
            planta.efectos_secundarios = [];
            planta.usos = [];

            // Obtener Galería de Crecimiento
            // Obtener Galería de Crecimiento
            if (planta.fotos_crecimiento) {
                try {
                    let parsed = JSON.parse(planta.fotos_crecimiento);
                    // Asegurar que sea array de strings
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Si por error hay objetos viejos
                        if (typeof parsed[0] === 'object' && parsed[0].imagen_path) {
                            parsed = parsed.map(f => f.imagen_path);
                        }
                        // Filtrar vacíos
                        parsed = parsed.filter(f => typeof f === 'string' && f.trim().length > 0);
                        planta.galeria = parsed;
                    } else {
                        planta.galeria = [];
                    }
                } catch (e) {
                    planta.galeria = [];
                }
            } else {
                planta.galeria = [];
            }

            // Obtener Remedios
            const remedios = await db.allAsync("SELECT * FROM remedios WHERE nombre_cientifico = ?", [nombreCientifico]);

            // Obtener detalles completos para cada remedio
            if (remedios.length > 0) {
                for (let r of remedios) {
                    r.pasos = await db.allAsync("SELECT * FROM pasos WHERE id_remedio = ? ORDER BY num_paso", [r.id]);
                    r.contraindicaciones = await db.allAsync("SELECT * FROM contraindicaciones WHERE id_remedio = ?", [r.id]);
                    r.efectos_secundarios = await db.allAsync("SELECT * FROM efectos_secundarios WHERE id_remedio = ?", [r.id]);
                    r.usos = await db.allAsync(`
                        SELECT u.nombre, u.tipo 
                        FROM usos u 
                        JOIN remedios_usos ru ON u.id = ru.id_uso 
                        WHERE ru.id_remedio = ?`, [r.id]);
                }
            }
            planta.remedios = remedios;
        }

        // Renderizar solo el contenido de la planta
        res.render('partials/info-planta', { planta }, (err, html) => {
            if (err) {
                console.error('Error al renderizar:', err);
                return res.status(500).json({ error: 'Error al renderizar' });
            }
            res.send(html);
        });
    } catch (error) {
        console.error('Error al obtener planta:', error);
        res.status(500).json({ error: 'Error al obtener información de la planta' });
    }
});

// Ruta de perfil de usuario
router.get('/usuario/perfil', requireAuth, async (req, res) => {
    try {
        res.render('usuario/perfil', {
            usuario: req.session.usuario
        });
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.render('error', {
            mensaje: 'Error al cargar el perfil',
            usuario: req.session.usuario
        });
    }
});

// Ruta de historia
router.get('/usuario/historia', (req, res) => {
    res.render('usuario/historia', {
        usuario: res.locals.usuario || null,
        isAuthenticated: res.locals.isAuthenticated
    });
});

// Ruta de mis solicitudes
router.get('/usuario/mis-solicitudes', requireAuth, async (req, res) => {
    try {
        const usuario = req.session.usuario;

        const solicitudes = await db.allAsync(
            `SELECT 
                id_donacion as id, 
                correo_usuario as usuario,
                nombre_comun as nombre_planta, -- Alias for view compatibility
                distribucion_geografica as ubicacion, -- Alias for view compatibility
                fecha_donacion as fecha,
                estado,
                detalles as respuesta
             FROM donaciones 
             WHERE correo_usuario = ? 
             ORDER BY fecha_donacion DESC`,
            [usuario.correo]
        );

        res.render('usuario/mis-solicitudes', {
            usuario,
            solicitudes: solicitudes || []
        });
    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        res.render('error', {
            mensaje: 'Error al cargar las solicitudes',
            usuario: req.session.usuario
        });
    }
});

export default router;

