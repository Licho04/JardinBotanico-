import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

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

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario (Sequelize maneja la validación de duplicados automáticamente)
        const nuevoUsuario = await Usuario.create({
            usuario,
            nombre: nombre || '',
            mail,
            password: passwordHash,
            tipo
        });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                usuario: nuevoUsuario.usuario,
                mail: nuevoUsuario.mail,
                tipo: nuevoUsuario.tipo
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);

        // Manejar errores de duplicados
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields.usuario) {
                return res.status(400).json({
                    error: 'El nombre de usuario ya está en uso'
                });
            }
            if (error.fields.mail) {
                return res.status(400).json({
                    error: 'El correo electrónico ya está registrado'
                });
            }
        }

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
        const user = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { usuario: usuario },
                    { mail: usuario }
                ]
            }
        });

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
        } catch (error) {
            // Si falla bcrypt, podría ser contraseña en texto plano (BD antigua)
            passwordValida = false;
        }

        // Si bcrypt falló, verificar si es texto plano (contraseñas antiguas)
        if (!passwordValida && user.password === password) {
            passwordValida = true;
        }

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

// Verificar token (middleware)
export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({
            error: 'Token no proporcionado'
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
