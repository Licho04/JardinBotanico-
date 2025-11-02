import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

// Cambiar según ambiente: MySQL o SQLite
const USE_SQLITE = process.env.USE_SQLITE === 'true';

if (USE_SQLITE) {
    // SQLite para producción (o cuando el servidor no tenga MySQL)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    });
    console.log('✅ Usando SQLite');
} else {
    // MySQL para desarrollo (XAMPP)
    sequelize = new Sequelize(
        process.env.DB_NAME || 'JardinBotanico',
        process.env.DB_USER || 'ADMIN',
        process.env.DB_PASSWORD || '0192837465',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            }
        }
    );
    console.log('✅ Usando MySQL');
}

// Probar conexión
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos exitosa');
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
})();

export default sequelize;
