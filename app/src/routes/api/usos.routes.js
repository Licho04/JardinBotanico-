
import { Router } from 'express';
import db from '../../config/database.js';
import { verificarToken, verificarAdmin } from '../../controllers/auth.controller.js';

import { obtenerUsos, obtenerUsoPorId, crearUso, actualizarUso, eliminarUso } from '../../controllers/usos.controller.js';

const router = Router();

// Rutas públicas
router.get('/', obtenerUsos);
router.get('/:id', obtenerUsoPorId);

// Rutas protegidas (Admin)
router.post('/', verificarToken, verificarAdmin, crearUso);
router.put('/:id', verificarToken, verificarAdmin, actualizarUso);
router.delete('/:id', verificarToken, verificarAdmin, eliminarUso);

export default router;
