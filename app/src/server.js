import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Importar rutas API
import authRoutes from './routes/auth.routes.js';
import plantasRoutes from './routes/plantas.routes.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';

// Importar rutas de vistas
import indexRoutes from './routes/views/index.routes.js';
import authViewRoutes from './routes/views/auth.routes.js';
import solicitudesViewRoutes from './routes/views/solicitudes.routes.js';
import adminRoutes from './routes/views/admin.routes.js';

// Importar inicialización de base de datos
import './config/init-database.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors()); // Permitir peticiones desde cualquier origen
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: true })); // Parser de formularios
app.use(cookieParser()); // Parser de cookies

// Configurar sesiones
app.use(session({
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_cambiar_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Servir archivos estáticos
// Si estamos en Render con Disco, las imágenes vienen del disco persistente
if (process.env.DATA_PATH) {
    // Servir imágenes desde el disco persistente
    app.use('/recursos/imagenes', express.static(path.join(process.env.DATA_PATH, 'imagenes')));
}

// Servir el resto de recursos (CSS, JS, imágenes default) desde el proyecto
app.use('/recursos', express.static(path.join(__dirname, '../../recursos')));

// Rutas de vistas (deben ir antes de las rutas API para evitar conflictos)
app.use('/', indexRoutes);
app.use('/', authViewRoutes);
app.use('/', solicitudesViewRoutes);
app.use('/', adminRoutes);

// Rutas API (mantener compatibilidad con frontend PHP)
app.use('/api/auth', authRoutes);
app.use('/api/plantas', plantasRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Ruta raíz de API (para verificar que la API funciona)
app.get('/api', (req, res) => {
    res.json({
        mensaje: 'API de Jardín Botánico',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth (login, registro)',
            plantas: '/api/plantas (CRUD de plantas)',
            solicitudes: '/api/solicitudes (gestión de solicitudes)'
        }
    });
});

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        ruta: req.url
    });
});

// Manejo de errores 404 para vistas
app.use((req, res) => {
    res.status(404).render('error', {
        mensaje: 'Página no encontrada',
        usuario: req.session?.usuario || null,
        isAuthenticated: !!req.session?.usuario
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/`);
});

export default app;
