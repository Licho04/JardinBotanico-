import db from '../config/database.js';

// Obtener todas las solicitudes (admin) o las del usuario
export const obtenerSolicitudes = async (req, res) => {
    try {
        let query = 'SELECT * FROM solicitudes ORDER BY fecha DESC';
        let params = [];

        // Si no es admin, solo ver sus propias solicitudes
        if (req.usuario.tipo !== 1) {
            query = 'SELECT * FROM solicitudes WHERE usuario = ? ORDER BY fecha DESC';
            params = [req.usuario.id];
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
            'SELECT * FROM solicitudes WHERE id = ?',
            [id]
        );

        if (!solicitud) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Verificar permisos (solo el usuario dueño o admin pueden ver)
        if (req.usuario.tipo !== 1 && solicitud.usuario !== req.usuario.id) {
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
            nombre_planta,
            descripcion_planta,
            propiedades_medicinales,
            ubicacion,
            motivo_donacion
        } = req.body;

        // Validar campos requeridos
        if (!nombre_planta || !descripcion_planta || !ubicacion) {
            return res.status(400).json({
                error: 'Nombre de planta, descripción y ubicación son requeridos'
            });
        }

        const usuario = req.usuario.id;

        const fecha = new Date().toISOString();
        const estado = 'pendiente';

        const resultado = await db.runAsync(
            `INSERT INTO solicitudes
            (usuario, nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion, fecha, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario, nombre_planta, descripcion_planta, propiedades_medicinales || '', ubicacion, motivo_donacion || '', fecha, estado]
        );

        res.status(201).json({
            mensaje: 'Solicitud creada correctamente',
            solicitud: {
                id: resultado.lastID,
                usuario,
                nombre_planta,
                descripcion_planta,
                propiedades_medicinales,
                ubicacion,
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
            'SELECT * FROM solicitudes WHERE id = ?',
            [id]
        );

        if (!solicitudExistente) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Actualizar estado
        let query = 'UPDATE solicitudes SET estado = ?';
        let params = [estatus];

        // Si hay comentarios/respuesta, actualizar también
        if (comentarios !== undefined) {
            query += ', respuesta = ?';
            params.push(comentarios);
        }

        query += ' WHERE id = ?';
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
            'SELECT * FROM solicitudes WHERE id = ?',
            [id]
        );

        if (!solicitud) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Verificar permisos (solo el usuario dueño o admin pueden eliminar)
        if (req.usuario.tipo !== 1 && solicitud.usuario !== req.usuario.id) {
            return res.status(403).json({
                error: 'No tienes permisos para eliminar esta solicitud'
            });
        }

        await db.runAsync('DELETE FROM solicitudes WHERE id = ?', [id]);

        res.json({
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
