import express from 'express';
import db from '../../config/database.js';
import bcrypt from 'bcrypt';
import { requireAdmin } from '../../middleware/auth.middleware.js';
import { upload } from '../../controllers/plantas.controller.js';

const router = express.Router();

// Panel principal de administración
router.get('/administracion/admin', requireAdmin, async (req, res) => {
    try {
        const vista = req.query.vista || 'usuarios';
        const usuario = req.session.usuario;

        let data = { usuario, vista };

        if (vista === 'usuarios') {
            const usuarios = await db.allAsync('SELECT usuario, nombre, mail, tipo FROM usuarios ORDER BY usuario');
            data.usuarios = usuarios || [];
        } else if (vista === 'plantas') {
            const plantas = await db.allAsync('SELECT * FROM plantas ORDER BY nombre');
            data.plantas = plantas || [];
        } else if (vista === 'solicitudes') {
            const solicitudes = await db.allAsync(
                'SELECT * FROM solicitudes ORDER BY fecha DESC'
            );
            data.solicitudes = solicitudes || [];
        }

        res.render('administracion/admin', data);
    } catch (error) {
        console.error('Error al cargar panel admin:', error);
        res.render('error', {
            mensaje: 'Error al cargar el panel de administración',
            usuario: req.session.usuario,
            isAuthenticated: true
        });
    }
});

// ========== CRUD USUARIOS ==========

// Obtener formulario para agregar usuario
router.get('/administracion/usuarios/agregar', requireAdmin, (req, res) => {
    res.render('administracion/partials/form-usuario', {
        usuario: null,
        accion: 'agregar'
    });
});

// Crear usuario
router.post('/administracion/usuarios', requireAdmin, async (req, res) => {
    try {
        const { usuario, nombre, mail, password, tipo } = req.body;

        if (!usuario || !mail || !password) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }

        // Verificar si el usuario ya existe
        const existe = await db.getAsync('SELECT usuario FROM usuarios WHERE usuario = ? OR mail = ?', [usuario, mail]);
        if (existe) {
            return res.status(400).json({ error: 'Usuario o correo ya existe' });
        }

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, mail, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', mail, passwordHash, tipo ? 1 : 0]
        );

        res.json({ success: true, mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Obtener formulario para editar usuario
router.get('/administracion/usuarios/:usuario/editar', requireAdmin, async (req, res) => {
    try {
        const { usuario } = req.params;
        const user = await db.getAsync('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.render('administracion/partials/form-usuario', {
            usuario: user,
            accion: 'editar'
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Actualizar usuario (también acepta POST para formularios)
const actualizarUsuario = async (req, res) => {
    try {
        const { usuario } = req.params;
        const { nombre, mail, password, tipo } = req.body;

        let query = 'UPDATE usuarios SET nombre = ?, mail = ?, tipo = ?';
        let params = [nombre || '', mail, tipo ? 1 : 0];

        // Si hay nueva contraseña, actualizarla
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(passwordHash);
        }

        query += ' WHERE usuario = ?';
        params.push(usuario);

        await db.runAsync(query, params);

        res.json({ success: true, mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

router.put('/administracion/usuarios/:usuario', requireAdmin, actualizarUsuario);
router.post('/administracion/usuarios/:usuario/actualizar', requireAdmin, actualizarUsuario);

// Eliminar usuario
router.delete('/administracion/usuarios/:usuario', requireAdmin, async (req, res) => {
    try {
        const { usuario } = req.params;

        // No permitir eliminar el propio usuario admin
        if (usuario === req.session.usuario.usuario) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        // Eliminar solicitudes asociadas primero (para evitar error de FK)
        await db.runAsync('DELETE FROM solicitudes WHERE usuario = ?', [usuario]);

        // Eliminar usuario
        await db.runAsync('DELETE FROM usuarios WHERE usuario = ?', [usuario]);

        res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// ========== CRUD PLANTAS ==========

// Obtener formulario para agregar planta
router.get('/administracion/plantas/agregar', requireAdmin, (req, res) => {
    res.render('administracion/partials/form-planta', {
        planta: null,
        accion: 'agregar'
    });
});

// Crear planta
router.post('/administracion/plantas', requireAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, propiedades, nombre_cientifico, zona_geografica, usos } = req.body;
        const imagen = req.file ? req.file.filename : null;

        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
        }

        await db.runAsync(
            'INSERT INTO plantas (nombre, descripcion, imagen, propiedades, nombre_cientifico, zona_geografica, usos) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, imagen, propiedades || '', nombre_cientifico || '', zona_geografica || '', usos || '']
        );

        res.json({ success: true, mensaje: 'Planta creada correctamente' });
    } catch (error) {
        console.error('Error al crear planta:', error);
        res.status(500).json({ error: 'Error al crear planta' });
    }
});

// Obtener formulario para editar planta
router.get('/administracion/plantas/:id/editar', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const planta = await db.getAsync('SELECT * FROM plantas WHERE id = ?', [id]);

        if (!planta) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        res.render('administracion/partials/form-planta', {
            planta,
            accion: 'editar'
        });
    } catch (error) {
        console.error('Error al obtener planta:', error);
        res.status(500).json({ error: 'Error al obtener planta' });
    }
});

// Actualizar planta
const actualizarPlanta = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, propiedades, nombre_cientifico, zona_geografica, usos } = req.body;

        let query = 'UPDATE plantas SET nombre = ?, descripcion = ?, propiedades = ?, nombre_cientifico = ?, zona_geografica = ?, usos = ?';
        let params = [nombre, descripcion, propiedades || '', nombre_cientifico || '', zona_geografica || '', usos || ''];

        // Si hay nueva imagen, actualizarla
        if (req.file) {
            query += ', imagen = ?';
            params.push(req.file.filename);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.runAsync(query, params);

        res.json({ success: true, mensaje: 'Planta actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar planta:', error);
        res.status(500).json({ error: 'Error al actualizar planta' });
    }
};

router.put('/administracion/plantas/:id', requireAdmin, upload.single('imagen'), actualizarPlanta);
router.post('/administracion/plantas/:id/actualizar', requireAdmin, upload.single('imagen'), actualizarPlanta);

// Eliminar planta
router.delete('/administracion/plantas/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.runAsync('DELETE FROM plantas WHERE id = ?', [id]);
        res.json({ success: true, mensaje: 'Planta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({ error: 'Error al eliminar planta' });
    }
});

// ========== CRUD SOLICITUDES ==========

// Obtener formulario para responder solicitud
router.get('/administracion/solicitudes/:id/responder', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await db.getAsync('SELECT * FROM solicitudes WHERE id = ?', [id]);

        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.render('administracion/partials/form-responder-solicitud', {
            solicitud
        });
    } catch (error) {
        console.error('Error al obtener solicitud:', error);
        res.status(500).json({ error: 'Error al obtener solicitud' });
    }
});

// Responder/Actualizar estado de solicitud
const actualizarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, respuesta } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Estado es requerido' });
        }

        await db.runAsync(
            'UPDATE solicitudes SET estado = ?, respuesta = ? WHERE id = ?',
            [estado, respuesta || '', id]
        );

        res.json({ success: true, mensaje: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
};

router.put('/administracion/solicitudes/:id', requireAdmin, actualizarSolicitud);
router.post('/administracion/solicitudes/:id/actualizar', requireAdmin, actualizarSolicitud);

// Eliminar solicitud
router.delete('/administracion/solicitudes/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.runAsync('DELETE FROM solicitudes WHERE id = ?', [id]);
        res.json({ success: true, mensaje: 'Solicitud eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
});

export default router;

