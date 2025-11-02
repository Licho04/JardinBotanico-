import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
    usuario: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tipo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            isIn: [[0, 1]] // 0 = usuario, 1 = admin
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});

export default Usuario;
