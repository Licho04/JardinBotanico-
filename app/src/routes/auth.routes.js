import express from 'express';
import { registro, login, verificarToken, me } from '../controllers/auth.controller.js';

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

/**
 * GET /api/auth/me
 * Retorna la información del usuario autenticado
 */
router.get('/me', verificarToken, me);

export default router;
