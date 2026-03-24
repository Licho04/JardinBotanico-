
import { Router } from 'express';
import {
    getRemedios,
    getRemedioById,
    createRemedio,
    updateRemedio,
    deleteRemedio
} from '../../controllers/remedios.controller.js';
import { verificarToken, verificarAdmin } from '../../controllers/auth.controller.js';

const router = Router();

// Rutas Públicas
router.get('/', getRemedios); // ?nombre_cientifico=...
router.get('/:id', getRemedioById);

// Rutas Protegidas (Admin)
router.post('/', verificarToken, verificarAdmin, createRemedio);
router.put('/:id', verificarToken, verificarAdmin, updateRemedio);
router.delete('/:id', verificarToken, verificarAdmin, deleteRemedio);

export default router;
