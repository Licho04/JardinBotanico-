import jwt from 'jsonwebtoken';
import db from '../config/database.js';

/**
 * Middleware para verificar sesión (usando cookies/session)
 * Para páginas que requieren autenticación
 */
export const requireAuth = async (req, res, next) => {
    try {
        // Verificar si hay sesión
        if (req.session && req.session.usuario) {
            req.usuario = req.session.usuario;
            return next();
        }

        // Si no hay sesión, redirigir al login
        return res.redirect('/auth/login');
    } catch (error) {
        console.error('Error en requireAuth:', error);
        return res.redirect('/auth/login');
    }
};

/**
 * Middleware para verificar si es administrador
 */
export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.session || !req.session.usuario) {
            return res.redirect('/auth/login');
        }

        // Verificar si es admin (soporte para 'admin' string y 1 legacy)
        if (req.session.usuario.tipo !== 'admin' && req.session.usuario.tipo !== 1) {
            return res.status(403).render('error', {
                mensaje: 'Acceso denegado. Se requieren permisos de administrador',
                usuario: req.session.usuario
            });
        }

        req.usuario = req.session.usuario;
        next();
    } catch (error) {
        console.error('Error en requireAdmin:', error);
        return res.redirect('/auth/login');
    }
};

/**
 * Middleware opcional: agregar usuario a locals si está logueado
 */
export const optionalAuth = (req, res, next) => {
    if (req.session && req.session.usuario) {
        res.locals.usuario = req.session.usuario;
        res.locals.isAuthenticated = true;
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
};

