import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registrar nuevo usuario
export const registro = async (req, res) => {
    try {
        const { usuario, nombre, mail, password, tipo = 0 } = req.body;

        // Validar campos requeridos
        if (!usuario || !mail || !password) {
            return res.status(400).json({
                error: 'Faltan campos requeridos',
                requeridos: ['usuario', 'mail', 'password']
            });
        }

        // Verificar si el usuario ya existe
        const existeUsuario = await db.getAsync(
            'SELECT usuario FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        if (existeUsuario) {
            return res.status(400).json({
                error: 'El nombre de usuario ya está en uso'
            });
        }

        // Verificar si el correo ya existe
        const existeCorreo = await db.getAsync(
            'SELECT mail FROM usuarios WHERE mail = ?',
            [mail]
        );

        if (existeCorreo) {
            return res.status(400).json({
                error: 'El correo electrónico ya está registrado'
            });
        }

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const resultado = await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, mail, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', mail, passwordHash, tipo]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: resultado.lastID,
                usuario,
                mail,
                tipo
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error al registrar usuario',
            detalle: error.message
        });
    }
};

// Login de usuario
export const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Validar campos requeridos
        if (!usuario || !password) {
            return res.status(400).json({
                error: 'Usuario y contraseña son requeridos'
            });
        }

        // Buscar usuario (puede ser por nombre de usuario o email)
        const user = await db.getAsync(
            'SELECT * FROM usuarios WHERE usuario = ? OR mail = ?',
            [usuario, usuario]
        );

        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña (soporte para contraseñas antiguas en texto plano y nuevas hasheadas)
        let passwordValida = false;

        // Intentar primero con bcrypt (contraseñas nuevas)
        try {
            passwordValida = await bcrypt.compare(password, user.password);
            console.log('Bcrypt compare result:', passwordValida);
        } catch (error) {
            // Si falla bcrypt, podría ser contraseña en texto plano (BD antigua)
            console.log('Bcrypt compare error:', error.message);
            passwordValida = false;
        }

        // Si bcrypt falló, verificar si es texto plano (contraseñas antiguas)
        if (!passwordValida && user.password === password) {
            console.log('Password match - texto plano');
            passwordValida = true;
        }

        console.log('Password final validation:', passwordValida);
        console.log('User from DB:', user.usuario, 'Password stored:', user.password.substring(0, 20) + '...');

        if (!passwordValida) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.usuario,
                mail: user.mail,
                tipo: user.tipo
            },
            process.env.JWT_SECRET || 'tu_clave_secreta',
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                usuario: user.usuario,
                nombre: user.nombre,
                mail: user.mail,
                tipo: user.tipo
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            detalle: error.message
        });
    }
};

// Verificar token o sesión (Middleware híbrido)
export const verificarToken = (req, res, next) => {
    // 1. Verificar si hay sesión activa (Navegador)
    if (req.session && req.session.usuario) {
        // Normalizar objeto usuario para que coincida con la estructura del token JWT
        // El token tiene 'id' pero la sesión tiene 'usuario' como clave primaria
        req.usuario = {
            ...req.session.usuario,
            id: req.session.usuario.usuario
        };
        return next();
    }

    // 2. Verificar si hay token Bearer (API / Postman)
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({
            error: 'Token no proporcionado. Inicie sesión.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
};

// Verificar si es administrador
export const verificarAdmin = (req, res, next) => {
    if (req.usuario.tipo !== 1) {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }
    next();
};
