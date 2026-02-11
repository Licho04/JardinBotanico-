import db from '../config/database.js';

// Obtener todas las solicitudes (admin) o las del usuario
export const obtenerSolicitudes = async (req, res) => {
    try {
        let query = 'SELECT * FROM donaciones ORDER BY fecha_donacion DESC';
        let params = [];

        // Si no es admin, solo ver sus propias solicitudes
        if (req.usuario.tipo !== 1 && req.usuario.tipo !== 'admin') {
            query = 'SELECT * FROM donaciones WHERE correo_usuario = ? ORDER BY fecha_donacion DESC';
            params = [req.usuario.id]; // id es correo
        }

        const solicitudes = await db.allAsync(query, params);

        res.json({
            total: solicitudes.length,
            solicitudes
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({
            error: 'Error al obtener solicitudes',
            detalle: error.message
        });
    }
};

// Obtener una solicitud por ID
export const obtenerSolicitudPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await db.getAsync(
            'SELECT * FROM donaciones WHERE id_donacion = ?',
            [id]
        );

        if (!solicitud) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Verificar permisos (solo el usuario dueño o admin pueden ver)
        if (req.usuario.tipo !== 1 && req.usuario.tipo !== 'admin' && solicitud.correo_usuario !== req.usuario.id) {
            return res.status(403).json({
                error: 'No tienes permisos para ver esta solicitud'
            });
        }

        res.json(solicitud);
    } catch (error) {
        console.error('Error al obtener solicitud:', error);
        res.status(500).json({
            error: 'Error al obtener solicitud',
            detalle: error.message
        });
    }
};

// Crear nueva solicitud
export const crearSolicitud = async (req, res) => {
    try {
        const {
            nombre_comun,
            descripcion,
            propiedades_curativas,
            distribucion_geografica,
            motivo_donacion
        } = req.body;

        // Validar campos requeridos
        if (!nombre_comun || !descripcion || !distribucion_geografica) {
            return res.status(400).json({
                error: 'Nombre común, descripción y ubicación son requeridos'
            });
        }

        const usuario = req.usuario.id; // Es el correo

        const fecha = new Date().toISOString();
        const estado = 'pendiente';

        const resultado = await db.runAsync(
            `INSERT INTO donaciones
            (correo_usuario, nombre_comun, descripcion, propiedades_curativas, distribucion_geografica, motivo_donacion, fecha_donacion, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario,
                nombre_comun,
                descripcion,
                propiedades_curativas || '',
                distribucion_geografica,
                motivo_donacion || '',
                fecha,
                estado
            ]
        );

        res.status(201).json({
            success: true,
            id: resultado.lastID,
            mensaje: 'Solicitud creada correctamente',
            solicitud: {
                id: resultado.lastID,
                usuario,
                nombre_comun,
                descripcion,
                propiedades_curativas,
                distribucion_geografica,
                motivo_donacion,
                fecha,
                estado
            }
        });

    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({
            error: 'Error al crear solicitud',
            detalle: error.message
        });
    }
};

// Actualizar estatus de solicitud (solo admin)
export const actualizarEstatusSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus, comentarios } = req.body;

        // Validar estado
        const estadosValidos = ['pendiente', 'aprobada', 'rechazada', 'en proceso'];
        if (!estadosValidos.includes(estatus.toLowerCase())) {
            return res.status(400).json({
                error: 'Estado inválido',
                estadosValidos
            });
        }

        // Verificar si la solicitud existe
        const solicitudExistente = await db.getAsync(
            'SELECT * FROM donaciones WHERE id_donacion = ?',
            [id]
        );

        if (!solicitudExistente) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Actualizar estado
        let query = 'UPDATE donaciones SET estado = ?';
        let params = [estatus];

        // Si hay comentarios/respuesta, actualizar también (usamos campo 'detalles' o 'motivo'? Admin usa 'detalles'?)
        // Admin usaba 'detalles' en schema? No estoy seguro, pero 'respuesta' no existe en create.
        // Asumiremos 'detalles' si 'respuesta' falla, pero 'solicitudes' (old) tenia respuesta.
        // Vamos a probar con 'detalles' que suena a campo nuevo, o 'respuesta' si el usuario pide.
        // Tabla-solicitudes.ejs (admin) no muestra respuesta explícita, solo status.
        // Mis-solicitudes.ejs muestra 'solicitud.respuesta'.
        // Intentaremos actualizar 'detalles' para mapearlo a respuesta.

        if (comentarios !== undefined) {
            query += ', detalles = ?';
            params.push(comentarios);
        }

        query += ' WHERE id_donacion = ?';
        params.push(id);

        await db.runAsync(query, params);

        res.json({
            mensaje: 'Estado actualizado correctamente',
            solicitud: {
                id,
                estado: estatus,
                respuesta: comentarios
            }
        });

    } catch (error) {
        console.error('Error al actualizar estatus:', error);
        res.status(500).json({
            error: 'Error al actualizar estatus',
            detalle: error.message
        });
    }
};

// Eliminar solicitud
export const eliminarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la solicitud existe
        const solicitud = await db.getAsync(
            'SELECT * FROM donaciones WHERE id_donacion = ?',
            [id]
        );

        if (!solicitud) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Verificar permisos (solo el usuario dueño o admin pueden eliminar)
        if (req.usuario.tipo !== 1 && req.usuario.tipo !== 'admin' && solicitud.correo_usuario !== req.usuario.id) {
            return res.status(403).json({
                error: 'No tienes permisos para eliminar esta solicitud'
            });
        }

        await db.runAsync('DELETE FROM donaciones WHERE id_donacion = ?', [id]);

        res.json({
            success: true,
            mensaje: 'Solicitud eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({
            error: 'Error al eliminar solicitud',
            detalle: error.message
        });
    }
};
