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

        // Obtener todas las plantas
        const plantas = await db.allAsync('SELECT nombre, imagen FROM plantas ORDER BY nombre');

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

        const planta = await db.getAsync(
            'SELECT * FROM plantas WHERE nombre = ?',
            [nombre]
        );

        if (!planta) {
            return res.status(404).json({ error: 'Planta no encontrada' });
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
            'SELECT * FROM solicitudes WHERE usuario = ? ORDER BY fecha DESC',
            [usuario.usuario]
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

