<?php
/**
 * Configuración de la API según el entorno
 * 
 * Detecta automáticamente si estás en desarrollo local o en producción
 * y configura la URL de la API apropiadamente.
 */

// Detectar si estamos en desarrollo local o en servidor de producción
$esLocal = (
    $_SERVER['HTTP_HOST'] === 'localhost' ||
    $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
    strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0 ||
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1:') === 0
);

if ($esLocal) {
    // ===== DESARROLLO LOCAL =====
    // API corriendo en tu máquina local
    define('API_URL', 'http://localhost:3001/api');
    
    // Opcional: mostrar mensaje en desarrollo
    // error_log("🔧 MODO DESARROLLO: Usando API local");
    
} else {
    // ===== PRODUCCIÓN (SERVIDOR) =====
    // API corriendo en el servidor compartido
    // 🔴 CAMBIAR ESTA URL por la del servidor de tu universidad
    
    // Opción 1: Puerto directo
    define('API_URL', 'http://servidor-universidad.edu.mx:3001/api');
    
    // Opción 2: Subdominio (si está configurado)
    // define('API_URL', 'https://api-jardin.universidad.edu.mx/api');
    
    // Opción 3: Ruta en el mismo dominio
    // define('API_URL', 'https://servidor-universidad.edu.mx/api');
}

/**
 * Verificar que la constante fue definida
 */
if (!defined('API_URL')) {
    die('Error: API_URL no está definida en config_api.php');
}

?>

