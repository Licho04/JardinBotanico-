import express from 'express';
import {
    obtenerPlantas,
    obtenerPlantaPorId,
    crearPlanta,
    actualizarPlanta,
    eliminarPlanta,
    upload
} from '../controllers/plantas.controller.js';
import { verificarToken, verificarAdmin } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * GET /api/plantas
 * Obtener todas las plantas (público)
 */
router.get('/', obtenerPlantas);

/**
 * GET /api/plantas/:id
 * Obtener una planta por ID (público)
 */
router.get('/:id', obtenerPlantaPorId);

/**
 * POST /api/plantas
 * Crear nueva planta (requiere autenticación y permisos de admin)
 */
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), crearPlanta);

/**
 * PUT /api/plantas/:id
 * Actualizar planta (requiere autenticación y permisos de admin)
 */
router.put('/:id', verificarToken, verificarAdmin, upload.single('imagen'), actualizarPlanta);

/**
 * DELETE /api/plantas/:id
 * Eliminar planta (requiere autenticación y permisos de admin)
 */
router.delete('/:id', verificarToken, verificarAdmin, eliminarPlanta);

export default router;
