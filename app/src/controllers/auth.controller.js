import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registrar nuevo usuario
export const registro = async (req, res) => {
    try {
        const { usuario, nombre, mail, password, tipo = 'usuario' } = req.body;

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
            'SELECT correo FROM usuarios WHERE correo = ?',
            [mail]
        );
        // NOTA: En el esquema nuevo el campo es 'correo', pero en el código legacy era 'mail'.
        // Debemos estandarizar. Vamos a usar 'correo' en la consulta si la BD lo tiene como 'correo'.
        // Init-db dice: correo TEXT PRIMARY KEY.
        // El input del body dice 'mail'. Mapeamos.

        const correo = mail;

        const existeCorreoBD = await db.getAsync(
            'SELECT correo FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (existeCorreoBD) {
            return res.status(400).json({
                error: 'El correo electrónico ya está registrado'
            });
        }

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const resultado = await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, correo, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', correo, passwordHash, tipo]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                correo, // PK
                usuario,
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
        const { usuario, password } = req.body; // 'usuario' puede ser username o correo

        // Validar campos requeridos
        if (!usuario || !password) {
            return res.status(400).json({
                error: 'Usuario/Correo y contraseña son requeridos'
            });
        }

        // Buscar usuario (por usuario o correo)
        const user = await db.getAsync(
            'SELECT * FROM usuarios WHERE usuario = ? OR correo = ?',
            [usuario, usuario]
        );

        if (!user) {
            // Para seguridad, no decimos si el usuario existe o no, pero simulamos tiempo de espera.
            // Aunque en este caso simple, retornamos error genérico.
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar si está bloqueado
        if (user.bloqueado_hasta) {
            const ahora = new Date();
            const bloqueo = new Date(user.bloqueado_hasta);
            if (ahora < bloqueo) {
                const tiempoRestante = Math.ceil((bloqueo - ahora) / 1000 / 60); // Minutos
                return res.status(403).json({
                    error: `Cuenta bloqueada temporalmente por intentos fallidos. Intente de nuevo en ${tiempoRestante} minutos.`
                });
            } else {
                // El tiempo ya pasó, desbloquear (opcionalmente se hace al login exitoso, 
                // pero aquí limpiamos para que el contador de intentos reinicie limpio si falla de nuevo)
                await db.runAsync('UPDATE usuarios SET bloqueado_hasta = NULL, intentos_fallidos = 0 WHERE correo = ?', [user.correo]);
                user.intentos_fallidos = 0; // Actualizar objeto en memoria
            }
        }

        // Verificar contraseña
        let passwordValida = false;
        try {
            passwordValida = await bcrypt.compare(password, user.password);
        } catch (error) {
            passwordValida = false;
        }

        // Fallback texto plano (legacy)
        if (!passwordValida && user.password === password) {
            passwordValida = true;
        }

        if (!passwordValida) {
            // Incrementar intentos fallidos
            const nuevosIntentos = (user.intentos_fallidos || 0) + 1;
            let updateQuery = 'UPDATE usuarios SET intentos_fallidos = ? WHERE correo = ?';
            let params = [nuevosIntentos, user.correo];

            // Si llega a 5 intentos, bloquear
            if (nuevosIntentos >= 5) {
                const bloqueoHasta = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
                updateQuery = 'UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE correo = ?';
                params = [nuevosIntentos, bloqueoHasta.toISOString(), user.correo];

                await db.runAsync(updateQuery, params);

                return res.status(403).json({
                    error: 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por 15 minutos.'
                });
            }

            await db.runAsync(updateQuery, params);

            return res.status(401).json({
                error: `Credenciales inválidas. Intentos restantes: ${5 - nuevosIntentos}`
            });
        }

        // Login Exitoso: Resetear contadores
        if (user.intentos_fallidos > 0 || user.bloqueado_hasta) {
            await db.runAsync(
                'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE correo = ?',
                [user.correo]
            );
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.correo, // PK es correo ahora
                usuario: user.usuario,
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
                correo: user.correo,
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

// Verificar token o sesión
export const verificarToken = (req, res, next) => {
    // 1. Sesión
    if (req.session && req.session.usuario) {
        req.usuario = {
            ...req.session.usuario,
            id: req.session.usuario.correo
        };
        return next();
    }

    // 2. Token Bearer
    const token = req.headers['authorization']?.split(' ')[1];

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
    // Ahora tipo es string 'admin'
    if (req.usuario.tipo !== 'admin' && req.usuario.tipo !== 1) { // Compatibilidad con int 1
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }
    next();
};
