-- Script para ajustar la base de datos para la API

-- 1. Asegurarse de que el campo password sea suficientemente largo para bcrypt
ALTER TABLE usuarios MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- 2. Agregar campo id autoincremental si no existe (opcional)
-- ALTER TABLE usuarios ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;

-- 3. Agregar campo comentarios a solicitudes_donacion si no existe
ALTER TABLE solicitudes_donacion ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- 4. Asegurarse de que plantas tenga campo id autoincremental
-- ALTER TABLE plantas ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;

SELECT 'Base de datos ajustada correctamente' AS mensaje;
