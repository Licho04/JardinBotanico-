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
 * GET /api/plantas/:nombre_cientifico
 * Obtener una planta por Nombre Científico (público)
 */
router.get('/:nombre_cientifico', obtenerPlantaPorId);

/**
 * POST /api/plantas
 * Crear nueva planta (requiere autenticación y permisos de admin)
 */
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), crearPlanta);

/**
 * PUT /api/plantas/:nombre_cientifico
 * Actualizar planta (requiere autenticación y permisos de admin)
 */
router.put('/:nombre_cientifico', verificarToken, verificarAdmin, upload.single('imagen'), actualizarPlanta);

/**
 * DELETE /api/plantas/:nombre_cientifico
 * Eliminar planta (requiere autenticación y permisos de admin)
 */
router.delete('/:nombre_cientifico', verificarToken, verificarAdmin, eliminarPlanta);

export default router;
