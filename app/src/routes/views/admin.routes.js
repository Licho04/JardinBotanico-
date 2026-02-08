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
            const usuarios = await db.allAsync('SELECT usuario, nombre, correo, tipo FROM usuarios ORDER BY usuario');
            data.usuarios = usuarios || [];
        } else if (vista === 'plantas') {
            // Unir física e info
            const query = `
                SELECT pf.id_planta as id, pf.nombre_propio as nombre, pf.situacion, pi.nombre_cientifico 
                FROM planta_fisica pf
                LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
                ORDER BY pf.nombre_propio
            `;
            const plantas = await db.allAsync(query);
            data.plantas = plantas || [];
        } else if (vista === 'solicitudes') { // Ahora donaciones
            const solicitudes = await db.allAsync(
                'SELECT * FROM donaciones ORDER BY fecha_donacion DESC'
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
        console.log('📝 [CREATE USER] Request Body:', req.body);
        const { usuario, nombre, mail, password, tipo } = req.body;

        if (!usuario || !mail || !password) {
            console.error('❌ [CREATE USER] Campos faltantes:', { usuario: !!usuario, mail: !!mail, password: !!password });
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }

        // Verificar si el usuario ya existe
        const existe = await db.getAsync('SELECT usuario FROM usuarios WHERE usuario = ? OR correo = ?', [usuario, mail]);
        if (existe) {
            return res.status(400).json({ error: 'Usuario o correo ya existe' });
        }

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, correo, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', mail, passwordHash, tipo === '1' || tipo === 'admin' ? 'admin' : 'usuario']
        );

        console.log('✅ [CREATE USER] Usuario creado exitosamente:', usuario);
        res.json({ success: true, mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        console.error('❌ [CREATE USER] Error:', error);
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

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { usuario } = req.params;
        const { nombre, mail, password, tipo } = req.body;

        let query = 'UPDATE usuarios SET nombre = ?, correo = ?, tipo = ?';
        let params = [nombre || '', mail, tipo === '1' || tipo === 'admin' ? 'admin' : 'usuario'];

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
        console.log(`🗑️ [DELETE USER] Intentando eliminar usuario: ${usuario}`);

        // No permitir eliminar el propio usuario admin
        if (usuario === req.session.usuario.usuario) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        // Eliminar dependencias manualmente (donaciones)
        // NOTA: 'donaciones' usa 'correo_usuario' como FK. Necesitamos buscar el correo del usuario antes.
        const userToDelete = await db.getAsync('SELECT correo FROM usuarios WHERE usuario = ?', [usuario]);

        if (userToDelete) {
            const resDon = await db.runAsync('DELETE FROM donaciones WHERE correo_usuario = ?', [userToDelete.correo]);
            console.log(`- Donaciones eliminadas: ${resDon.changes}`);
        }

        // Eliminar usuario
        const resUser = await db.runAsync('DELETE FROM usuarios WHERE usuario = ?', [usuario]);
        console.log(`- Usuario eliminado: ${resUser.changes}`);

        if (resUser.changes === 0) {
            throw new Error("Usuario no encontrado o no se pudo eliminar");
        }

        res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('❌ [DELETE USER] Error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario: ' + error.message });
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
        const {
            nombre, descripcion, propiedades, nombre_cientifico, zona_geografica//, ...
        } = req.body;
        const imagen = req.file ? req.file.filename : null;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        // Lógica simplificada: Insertar en planta_info y luego en planta_fisica
        // 1. Planta Info (Si no existe, crearla o ignorar)
        // Usamos nombre científico si lo hay, sino generamos uno temporal basado en el nombre
        const pkCientifico = nombre_cientifico || `${nombre} (Pendiente)`;

        await db.runAsync(`
            INSERT OR IGNORE INTO planta_info (nombre_cientifico, descripcion, propiedades_curativas, nombres_comunes, distribucion_geografica)
            VALUES (?, ?, ?, ?, ?)
        `, [pkCientifico, descripcion || '', propiedades || '', nombre, zona_geografica || '']);

        // 2. Planta Fisica
        await db.runAsync(`
            INSERT INTO planta_fisica (nombre_propio, situacion, imagen_path, nombre_cientifico)
            VALUES (?, 'Sana', ?, ?)
        `, [nombre, imagen, pkCientifico]);

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
        const query = `
            SELECT pf.id_planta as id, pf.nombre_propio as nombre, pf.imagen_path as imagen, pi.*
            FROM planta_fisica pf
            LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
            WHERE pf.id_planta = ?
        `;
        const planta = await db.getAsync(query, [id]);

        if (!planta) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        // Alias para compatibilidad con vista
        planta.propiedades = planta.propiedades_curativas;
        planta.zona_geografica = planta.distribucion_geografica;

        res.render('administracion/partials/form-planta', {
            planta,
            accion: 'editar'
        });
    } catch (error) {
        console.error('Error al obtener planta:', error);
        res.status(500).json({ error: 'Error al obtener planta' });
    }
});

// Actualizar planta (Simplificado: solo actualiza planta_fisica e info básica)
const actualizarPlanta = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, propiedades } = req.body; // ... otros campos

        // Primero obtener el nombre_cientifico asociado
        const pf = await db.getAsync('SELECT nombre_cientifico FROM planta_fisica WHERE id_planta = ?', [id]);

        if (pf) {
            // Actualizar Info
            await db.runAsync('UPDATE planta_info SET descripcion = ?, propiedades_curativas = ? WHERE nombre_cientifico = ?',
                [descripcion || '', propiedades || '', pf.nombre_cientifico]);

            // Actualizar Fisica
            let query = 'UPDATE planta_fisica SET nombre_propio = ?';
            let params = [nombre];

            if (req.file) {
                query += ', imagen_path = ?';
                params.push(req.file.filename);
            }

            query += ' WHERE id_planta = ?';
            params.push(id);

            await db.runAsync(query, params);
        }

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
        await db.runAsync('DELETE FROM planta_fisica WHERE id_planta = ?', [id]);
        res.json({ success: true, mensaje: 'Planta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar planta:', error);
        res.status(500).json({ error: 'Error al eliminar planta' });
    }
});

// ========== CRUD DONACIONES (antes Solicitudes) ==========

// Obtener formulario para responder solicitud
router.get('/administracion/solicitudes/:id/responder', requireAdmin, async (req, res) => {
    // Nota: Mantenemos la ruta URL 'solicitudes' pero usamos tabla 'donaciones'
    try {
        const { id } = req.params;
        const solicitud = await db.getAsync('SELECT * FROM donaciones WHERE id_donacion = ?', [id]);

        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        // Alias id_donacion -> id para la vista
        solicitud.id = solicitud.id_donacion;

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
        const { estado, respuesta } = req.body; // 'respuesta' iría a 'motivo' o nuevo campo? 
        // Donaciones no tiene campo 'respuesta' en el nuevo esquema, solo 'estado', 'motivo', 'detalles'.
        // Asumiremos que solo actualizamos estado.

        if (!estado) {
            return res.status(400).json({ error: 'Estado es requerido' });
        }

        await db.runAsync(
            'UPDATE donaciones SET estado = ? WHERE id_donacion = ?',
            [estado, id]
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
        await db.runAsync('DELETE FROM donaciones WHERE id_donacion = ?', [id]);
        res.json({ success: true, mensaje: 'Solicitud eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
});

export default router;

