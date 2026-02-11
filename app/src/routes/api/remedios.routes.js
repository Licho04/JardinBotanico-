
import { Router } from 'express';
import {
    getRemedios,
    getRemedioById,
    createRemedio,
    updateRemedio,
    deleteRemedio
} from '../../controllers/remedios.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// Rutas Públicas
router.get('/', optionalAuth, getRemedios); // ?nombre_cientifico=...
router.get('/:id', optionalAuth, getRemedioById);

// Rutas Protegidas (Admin)
router.post('/', requireAuth, requireAdmin, createRemedio);
router.put('/:id', requireAuth, requireAdmin, updateRemedio);
router.delete('/:id', requireAuth, requireAdmin, deleteRemedio);

export default router;
