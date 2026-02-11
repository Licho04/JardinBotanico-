import express from 'express';
import db from '../../config/database.js';
import bcrypt from 'bcrypt';
import { requireAdmin } from '../../middleware/auth.middleware.js';

import { upload, crearPlanta, actualizarPlanta, eliminarPlanta } from '../../controllers/plantas.controller.js';

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
            // Unir física e info
            const query = `
                SELECT 
                    pf.id_planta as id, 
                    pf.nombre_propio as nombre, 
                    pf.situacion, 
                    pf.imagen_path as imagen,
                    pi.nombre_cientifico,
                    pi.fotos_crecimiento
                FROM planta_fisica pf
                LEFT JOIN planta_info pi ON pf.nombre_cientifico = pi.nombre_cientifico
                ORDER BY pf.nombre_propio
            `;
            const plantas = await db.allAsync(query);

            // Procesar imágenes para la vista de lista (Igual que en controller/index)
            if (plantas) {
                plantas.forEach(p => {
                    // Siempre intentamos sacar la foto de la galería si existe
                    if (!p.imagen || p.imagen === '' || p.fotos_crecimiento) {
                        if (p.fotos_crecimiento) {
                            try {
                                const galeria = JSON.parse(p.fotos_crecimiento);
                                if (Array.isArray(galeria) && galeria.length > 0) {
                                    // Flatten if objects (legacy) and Filter empty strings
                                    const validImages = galeria
                                        .map(g => (typeof g === 'object' && g.imagen_path) ? g.imagen_path : g)
                                        .filter(img => typeof img === 'string' && img.trim().length > 0);

                                    // Use the last VALID image
                                    if (validImages.length > 0) {
                                        p.imagen = validImages[validImages.length - 1];
                                    }
                                }
                            } catch (e) {
                                // Ignorar error de parseo
                            }
                        }
                    }
                });
            }
            data.plantas = plantas || [];
        } else if (vista === 'solicitudes') { // Ahora donaciones
            const solicitudes = await db.allAsync(
                'SELECT * FROM donaciones ORDER BY fecha_donacion DESC'
            );
            data.solicitudes = solicitudes || [];
        } else if (vista === 'usos') {
            const usos = await db.allAsync('SELECT * FROM usos ORDER BY nombre');
            data.usos = usos || [];
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
            console.error('❌ Campos faltantes:', { usuario: !!usuario, mail: !!mail, password: !!password });
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


        res.json({ success: true, mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        console.error('❌ Error:', error);
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


        // No permitir eliminar el propio usuario admin
        if (usuario === req.session.usuario.usuario) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        // Eliminar dependencias manualmente (donaciones)
        // NOTA: 'donaciones' usa 'correo_usuario' como FK. Necesitamos buscar el correo del usuario antes.
        const userToDelete = await db.getAsync('SELECT correo FROM usuarios WHERE usuario = ?', [usuario]);

        if (userToDelete) {
            const resDon = await db.runAsync('DELETE FROM donaciones WHERE correo_usuario = ?', [userToDelete.correo]);

        }

        // Eliminar usuario
        const resUser = await db.runAsync('DELETE FROM usuarios WHERE usuario = ?', [usuario]);


        if (resUser.changes === 0) {
            throw new Error("Usuario no encontrado o no se pudo eliminar");
        }

        res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario: ' + error.message });
    }
});

// ========== CRUD PLANTAS ==========

// Obtener formulario para agregar planta
router.get('/administracion/plantas/agregar', requireAdmin, async (req, res) => {
    // Ya no necesitamos Usos aquí
    res.render('administracion/partials/form-planta', {
        planta: null,
        accion: 'agregar'
    });
});

// Crear planta
router.post('/administracion/plantas', requireAdmin, upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'galeria', maxCount: 10 }
]), crearPlanta);

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

        // Obtener galería de fotos (JSON a Array)
        if (planta.fotos_crecimiento) {
            try {
                planta.galeria = JSON.parse(planta.fotos_crecimiento);
            } catch (e) {
                console.error('Error parsing fotos_crecimiento:', e);
                planta.galeria = [];
            }
        } else {
            planta.galeria = [];
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

router.put('/administracion/plantas/:id', requireAdmin, upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'galeria', maxCount: 10 }
]), actualizarPlanta);

router.post('/administracion/plantas/:id/actualizar', requireAdmin, upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'galeria', maxCount: 10 }
]), actualizarPlanta);

router.delete('/administracion/plantas/:id', requireAdmin, eliminarPlanta);

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

        // Actualizar estado y detalles (respuesta)
        await db.runAsync(
            'UPDATE donaciones SET estado = ?, detalles = ? WHERE id_donacion = ?',
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
        await db.runAsync('DELETE FROM donaciones WHERE id_donacion = ?', [id]);
        res.json({ success: true, mensaje: 'Solicitud eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
});

// ========== CRUD REMEDIOS ==========

// Ver lista de remedios de una planta
router.get('/administracion/plantas/:id/remedios', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.session.usuario;

        // Obtener planta base
        const planta = await db.getAsync('SELECT * FROM planta_fisica WHERE id_planta = ?', [id]);
        if (!planta) return res.redirect('/administracion/admin?vista=plantas');

        // Obtener remedios
        const remedios = await db.allAsync('SELECT * FROM remedios WHERE nombre_cientifico = ?', [planta.nombre_cientifico]);

        res.render('administracion/admin', {
            usuario,
            vista: 'remedios',
            planta,
            remedios
        });
    } catch (error) {
        console.error('Error al cargar remedios:', error);
        res.status(500).send('Error interno');
    }
});

// Obtener formulario para agregar remedio
router.get('/administracion/remedios/agregar', requireAdmin, async (req, res) => {
    const { planta_id } = req.query;
    const planta = await db.getAsync('SELECT * FROM planta_fisica WHERE id_planta = ?', [planta_id]);
    const usos = await db.allAsync('SELECT * FROM usos ORDER BY nombre');

    res.render('administracion/partials/form-remedio', {
        remedio: null,
        plantaId: planta_id,
        plantaNombreCientifico: planta ? planta.nombre_cientifico : '',
        usos
    });
});

// Obtener formulario para editar remedio
router.get('/administracion/remedios/:id/editar', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const remedio = await db.getAsync('SELECT * FROM remedios WHERE id = ?', [id]);
    const usos = await db.allAsync('SELECT * FROM usos ORDER BY nombre');

    if (remedio) {
        // Obtener pasos
        remedio.pasos = await db.allAsync('SELECT * FROM pasos WHERE id_remedio = ? ORDER BY num_paso', [id]);

        // Obtener relaciones para el formulario
        const contra = await db.allAsync("SELECT descripcion FROM contraindicaciones WHERE id_remedio = ?", [id]);
        remedio.contraindicaciones = contra.map(c => c.descripcion).join(', ');

        const efectos = await db.allAsync("SELECT descripcion FROM efectos_secundarios WHERE id_remedio = ?", [id]);
        remedio.efectos_secundarios = efectos.map(e => e.descripcion).join(', ');

        const usosRel = await db.allAsync("SELECT id_uso FROM remedios_usos WHERE id_remedio = ?", [id]);
        remedio.usosIds = usosRel.map(u => u.id_uso);
    }

    res.render('administracion/partials/form-remedio', {
        remedio,
        plantaId: null, // No necesario en edición
        plantaNombreCientifico: remedio ? remedio.nombre_cientifico : '',
        usos
    });
});

// ========== CRUD USOS ==========

// Obtener formulario para agregar uso
router.get('/administracion/usos/agregar', requireAdmin, (req, res) => {
    res.render('administracion/partials/form-uso', {
        uso: null,
        accion: 'agregar'
    });
});

// Obtener formulario para editar uso
router.get('/administracion/usos/:id/editar', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const uso = await db.getAsync('SELECT * FROM usos WHERE id = ?', [id]);

    if (!uso) {

        return res.status(404).send('Uso no encontrado');
    }

    res.render('administracion/partials/form-uso', {
        uso,
        accion: 'editar'
    });
});

// Configuración de Multer para subir base de datos
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storageDB = multer.diskStorage({
    destination: (req, file, cb) => {
        // Usar la misma ubicación que la base de datos actual
        const dbDir = path.dirname(db.filename);
        cb(null, dbDir);
    },
    filename: (req, file, cb) => {
        // Nombre temporal
        cb(null, 'database_restore.sqlite');
    }
});

const uploadDB = multer({
    storage: storageDB,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/x-sqlite3' || file.originalname.endsWith('.sqlite')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos .sqlite'));
        }
    }
});

// Restaurar base de datos
router.post('/administracion/restore', requireAdmin, uploadDB.single('database'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No se subió ningún archivo');
        }

        const currentDBPath = db.filename;
        const newDBPath = req.file.path;
        const backupPath = currentDBPath + '.bak';



        // 1. Cerrar conexión actual (Intentar, aunque sqlite3 no tiene método close síncrono fácil en wrapper)
        // En este wrapper db es una instancia.
        // await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve())); 
        // PELIGROSO: Si cerramos la conexión, el proceso podría quedar inestable si no reiniciamos.
        // ESTRATEGIA: Reemplazar archivo y confiar en sistema de archivos (atomic rename en linux) o reiniciar.

        // Windows/Linux file locking might be an issue.
        // Intentaremos renombrar la actual a .bak y mover la nueva a .sqlite
        // Si falla, restaurar .bak

        try {
            // Backup actual
            if (fs.existsSync(currentDBPath)) {
                // En windows si está abierto lanzará EBUSY.
                // En linux, rename funciona incluso con archivo abierto (pero la conexión DB seguiría apuntando al inodo viejo).
                // Por lo tanto, REQUERIMOS reiniciar la aplicación para que tome el nuevo archivo.

                // Copy en lugar de rename para minimizar EBUSY en lectura? No, escritura es el problema.
                fs.copyFileSync(currentDBPath, backupPath);
            }

            // Reemplazar (Copy content to existing file path might be better than rename if allowed)
            // O mejor: fs.copyFileSync(newDBPath, currentDBPath);
            // Esto sobrescribe.

            // INTENTO DE SOBRESCRITURA
            // Si funciona, genial. Si no, error.
            fs.copyFileSync(newDBPath, currentDBPath);

            // Borrar temporal
            fs.unlinkSync(newDBPath);



            // En Render, lo ideal sería reiniciar el proceso.
            // Podemos forzar un exit, Render reiniciará.
            res.send(`
                <h1>Restauración Exitosa</h1>
                <p>La base de datos ha sido reemplazada. El servidor se reiniciará para aplicar los cambios.</p>
                <script>
                    setTimeout(() => { window.location.href = '/administracion/admin'; }, 5000);
                </script>
            `);

            // Forzar reinicio tras responder
            setTimeout(() => {

                process.exit(0);
            }, 1000);

        } catch (err) {
            console.error('Error al reemplazar archivo:', err);
            res.status(500).send(`Error al reemplazar base de datos: ${err.message}. (Posiblemente bloqueada)`);
        }

    } catch (error) {
        console.error('Error en restauración:', error);
        res.status(500).send('Error interno en restauración');
    }
});

// Descargar respaldo de base de datos
router.get('/administracion/backup', requireAdmin, (req, res) => {
    try {
        const dbPath = db.filename;
        const date = new Date().toISOString().slice(0, 10);
        res.download(dbPath, `respaldo_jardin_${date}.sqlite`, (err) => {
            if (err) {
                console.error('Error al descargar base de datos:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error al generar respaldo');
                }
            }
        });
    } catch (error) {
        console.error('Error en ruta de respaldo:', error);
        res.status(500).send('Error interno');
    }
});

export default router;

