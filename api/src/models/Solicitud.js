import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const Solicitud = sequelize.define('Solicitud', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'usuario'
        }
    },
    nombre_planta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion_planta: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    propiedades_medicinales: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ubicacion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    motivo_donacion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_solicitud: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estatus: {
        type: DataTypes.STRING,
        defaultValue: 'Pendiente',
        validate: {
            isIn: [['Pendiente', 'Aprobada', 'Rechazada', 'En proceso']]
        }
    },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'solicitudes_donacion',
    timestamps: false
});

// Definir relaciones
Usuario.hasMany(Solicitud, { foreignKey: 'usuario' });
Solicitud.belongsTo(Usuario, { foreignKey: 'usuario' });

export default Solicitud;
