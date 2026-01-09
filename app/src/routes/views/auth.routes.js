import express from 'express';
import db from '../../config/database.js';
import bcrypt from 'bcrypt';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware para agregar usuario a todas las vistas
router.use(optionalAuth);

// Página de login
router.get('/auth/login', (req, res) => {
    // Si ya está logueado, redirigir al inicio
    if (req.session && req.session.usuario) {
        return res.redirect('/');
    }
    res.render('auth/login', {
        error: null,
        usuario: null,
        isAuthenticated: false
    });
});

// Procesar login
router.post('/auth/login', async (req, res) => {
    try {
        const { identificador, password } = req.body;

        if (!identificador || !password) {
            return res.render('auth/login', {
                error: 'Usuario/correo y contraseña son requeridos',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Buscar usuario (puede ser por nombre de usuario o email)
        const user = await db.getAsync(
            'SELECT * FROM usuarios WHERE usuario = ? OR mail = ?',
            [identificador, identificador]
        );

        if (!user) {
            return res.render('auth/login', {
                error: 'Usuario/correo o contraseña incorrectos',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Verificar contraseña
        let passwordValida = false;

        // Intentar primero con bcrypt
        try {
            passwordValida = await bcrypt.compare(password, user.password);
        } catch (error) {
            passwordValida = false;
        }

        // Si bcrypt falló, verificar si es texto plano (contraseñas antiguas)
        if (!passwordValida && user.password === password) {
            passwordValida = true;
        }

        if (!passwordValida) {
            return res.render('auth/login', {
                error: 'Usuario/correo o contraseña incorrectos',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Crear sesión
        req.session.usuario = {
            usuario: user.usuario,
            nombre: user.nombre,
            mail: user.mail,
            tipo: user.tipo
        };

        // Redirigir al inicio
        res.redirect('/');
    } catch (error) {
        console.error('Error en login:', error);
        res.render('auth/login', {
            error: 'Error al iniciar sesión. Intenta nuevamente.',
            usuario: null,
            isAuthenticated: false
        });
    }
});

// Página de registro
router.get('/auth/registro', (req, res) => {
    // Si ya está logueado, redirigir al inicio
    if (req.session && req.session.usuario) {
        return res.redirect('/');
    }
    res.render('auth/registro', {
        error: null,
        usuario: null,
        isAuthenticated: false
    });
});

// Procesar registro
router.post('/auth/registro', async (req, res) => {
    try {
        const { usuario, nombre, mail, password } = req.body;

        // Validar campos requeridos
        if (!usuario || !mail || !password) {
            return res.render('auth/registro', {
                error: 'Faltan campos requeridos',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Verificar si el usuario ya existe
        const existeUsuario = await db.getAsync(
            'SELECT usuario FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        if (existeUsuario) {
            return res.render('auth/registro', {
                error: 'El nombre de usuario ya está en uso',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Verificar si el correo ya existe
        const existeCorreo = await db.getAsync(
            'SELECT mail FROM usuarios WHERE mail = ?',
            [mail]
        );

        if (existeCorreo) {
            return res.render('auth/registro', {
                error: 'El correo electrónico ya está registrado',
                usuario: null,
                isAuthenticated: false
            });
        }

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, mail, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', mail, passwordHash, 0]
        );

        // Redirigir al login
        res.redirect('/auth/login?registro=exitoso');
    } catch (error) {
        console.error('Error en registro:', error);
        res.render('auth/registro', {
            error: 'Error al registrar usuario. Intenta nuevamente.',
            usuario: null,
            isAuthenticated: false
        });
    }
});

// Cerrar sesión
router.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/');
    });
});

export default router;

