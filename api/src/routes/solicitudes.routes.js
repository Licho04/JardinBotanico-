import express from 'express';
import {
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    crearSolicitud,
    actualizarEstatusSolicitud,
    eliminarSolicitud
} from '../controllers/solicitudes.controller.js';
import { verificarToken, verificarAdmin } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * GET /api/solicitudes
 * Obtener todas las solicitudes
 * - Admin: ve todas
 * - Usuario: solo las suyas
 */
router.get('/', verificarToken, obtenerSolicitudes);

/**
 * GET /api/solicitudes/:id
 * Obtener una solicitud por ID
 */
router.get('/:id', verificarToken, obtenerSolicitudPorId);

/**
 * POST /api/solicitudes
 * Crear nueva solicitud (requiere autenticación)
 */
router.post('/', verificarToken, crearSolicitud);

/**
 * PUT /api/solicitudes/:id/estatus
 * Actualizar estatus de solicitud (solo admin)
 */
router.put('/:id/estatus', verificarToken, verificarAdmin, actualizarEstatusSolicitud);

/**
 * DELETE /api/solicitudes/:id
 * Eliminar solicitud (dueño o admin)
 */
router.delete('/:id', verificarToken, eliminarSolicitud);

export default router;
