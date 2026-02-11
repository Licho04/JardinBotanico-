
import { Router } from 'express';
import db from '../../config/database.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';

import { obtenerUsos, obtenerUsoPorId, crearUso, actualizarUso, eliminarUso } from '../../controllers/usos.controller.js';

const router = Router();

// Rutas públicas
router.get('/', obtenerUsos);
router.get('/:id', obtenerUsoPorId);

// Rutas protegidas (Admin)
router.post('/', requireAuth, requireAdmin, crearUso);
router.put('/:id', requireAuth, requireAdmin, actualizarUso);
router.delete('/:id', requireAuth, requireAdmin, eliminarUso);

export default router;
