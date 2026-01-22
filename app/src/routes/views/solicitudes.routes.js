import express from 'express';
import db from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Enviar solicitud de donación
router.post('/solicitudes/enviar', requireAuth, async (req, res) => {
    try {
        const { nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion } = req.body;
        const usuario = req.session.usuario;

        if (!nombre_planta || !descripcion_planta || !propiedades_medicinales || !ubicacion || !motivo_donacion) {
            return res.render('error', {
                mensaje: 'Todos los campos son requeridos',
                usuario,
                isAuthenticated: true
            });
        }

        // Insertar solicitud
        await db.runAsync(
            `INSERT INTO solicitudes (usuario, nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion, estado, fecha)
             VALUES (?, ?, ?, ?, ?, ?, 'pendiente', datetime('now'))`,
            [usuario.usuario, nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion]
        );

        // Redirigir con mensaje de éxito
        res.redirect('/?solicitud=enviada');
    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        res.render('error', {
            mensaje: 'Error al enviar la solicitud. Intenta nuevamente.',
            usuario: req.session.usuario,
            isAuthenticated: true
        });
    }
});

export default router;

