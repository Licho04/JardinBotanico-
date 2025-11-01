import express from 'express';
import { registro, login } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /api/auth/registro
 * Registrar nuevo usuario
 */
router.post('/registro', registro);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', login);

export default router;
