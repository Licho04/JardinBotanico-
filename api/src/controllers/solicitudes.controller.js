import Solicitud from '../models/Solicitud.js';
import Usuario from '../models/Usuario.js';
import { Op } from 'sequelize';

// Obtener todas las solicitudes (admin) o las del usuario
export const obtenerSolicitudes = async (req, res) => {
    try {
        let whereClause = {};

        // Si no es admin, solo ver sus propias solicitudes
        if (req.usuario.tipo !== 1) {
            whereClause.usuario = req.usuario.id;
        }

        const solicitudes = await Solicitud.findAll({
            where: whereClause,
            order: [['fecha_solicitud', 'DESC']],
            include: [{
                model: Usuario,
                attributes: ['usuario', 'nombre', 'mail']
            }]
        });

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

        const solicitud = await Solicitud.findByPk(id, {
            include: [{
                model: Usuario,
                attributes: ['usuario', 'nombre', 'mail']
            }]
        });

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
        const fecha_solicitud = new Date();
        const estatus = 'Pendiente';

        const solicitud = await Solicitud.create({
            usuario,
            nombre_planta,
            descripcion_planta,
            propiedades_medicinales: propiedades_medicinales || '',
            ubicacion,
            motivo_donacion: motivo_donacion || '',
            fecha_solicitud,
            estatus
        });

        res.status(201).json({
            mensaje: 'Solicitud creada correctamente',
            solicitud
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

        // Validar estatus
        const estatusValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'En proceso'];
        if (!estatusValidos.includes(estatus)) {
            return res.status(400).json({
                error: 'Estatus inválido',
                estatusValidos
            });
        }

        // Buscar solicitud
        const solicitud = await Solicitud.findByPk(id);

        if (!solicitud) {
            return res.status(404).json({
                error: 'Solicitud no encontrada'
            });
        }

        // Actualizar estatus
        await solicitud.update({
            estatus,
            comentarios: comentarios !== undefined ? comentarios : solicitud.comentarios
        });

        res.json({
            mensaje: 'Estatus actualizado correctamente',
            solicitud
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

        // Buscar solicitud
        const solicitud = await Solicitud.findByPk(id);

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

        await solicitud.destroy();

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
