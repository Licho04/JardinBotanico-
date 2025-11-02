import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Planta = sequelize.define('Planta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_cientifico: {
        type: DataTypes.STRING,
        allowNull: true
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    propiedades: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    zona_geografica: {
        type: DataTypes.STRING,
        allowNull: true
    },
    usos: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'plantas',
    timestamps: false
});

export default Planta;
