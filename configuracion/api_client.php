<?php
/**
 * Cliente API para consumir la API REST de Node.js
 * Permite que PHP consuma la API en lugar de acceder directamente a la BD
 */

class ApiClient {
    private $apiBaseUrl;
    private $token;
    
    /**
     * Constructor
     * @param string $apiBaseUrl URL base de la API (ej: http://localhost:3000/api)
     */
    public function __construct($apiBaseUrl = null) {
        // Verificar que cURL esté disponible
        if (!function_exists('curl_init')) {
            throw new Exception('La extensión cURL no está disponible en PHP. Por favor, instálala.');
        }
        
        // URL de la API - ajustar según tu configuración
        $this->apiBaseUrl = $apiBaseUrl ?? 'http://localhost:3000/api';
        
        // Si hay un token guardado en sesión, usarlo
        if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['api_token'])) {
            $this->token = $_SESSION['api_token'];
        }
    }
    
    /**
     * Realizar petición HTTP a la API
     * @param string $method Método HTTP (GET, POST, PUT, DELETE)
     * @param string $endpoint Endpoint de la API (ej: /auth/login)
     * @param array $data Datos a enviar (para POST/PUT)
     * @param bool $requiresAuth Si requiere token de autenticación
     * @return array Respuesta de la API ['success' => bool, 'data' => mixed, 'error' => string]
     */
    private function request($method, $endpoint, $data = null, $requiresAuth = false) {
        $url = rtrim($this->apiBaseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        // Inicializar cURL
        $ch = curl_init($url);
        
        // Headers básicos
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        // Si requiere autenticación y tenemos token
        if ($requiresAuth && $this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        // Configurar cURL
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10
        ]);
        
        // Agregar datos si es POST/PUT
        if (in_array($method, ['POST', 'PUT']) && $data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        // Ejecutar petición
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        // Si hay error de cURL
        if ($error) {
            return [
                'success' => false,
                'error' => 'Error de conexión: ' . $error,
                'http_code' => 0
            ];
        }
        
        // Decodificar respuesta JSON
        $responseData = json_decode($response, true);
        
        // Si no es JSON válido
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'success' => false,
                'error' => 'Respuesta inválida de la API',
                'http_code' => $httpCode,
                'raw_response' => $response
            ];
        }
        
        // Determinar éxito basado en código HTTP
        $success = ($httpCode >= 200 && $httpCode < 300);
        
        return [
            'success' => $success,
            'data' => $responseData,
            'http_code' => $httpCode,
            'error' => $success ? null : ($responseData['error'] ?? 'Error desconocido')
        ];
    }
    
    /**
     * Login de usuario
     * @param string $usuario Usuario o correo
     * @param string $password Contraseña
     * @return array
     */
    public function login($usuario, $password) {
        $response = $this->request('POST', '/auth/login', [
            'usuario' => $usuario,
            'password' => $password
        ]);
        
        if ($response['success'] && isset($response['data']['token'])) {
            // Guardar token en sesión
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }
            $_SESSION['api_token'] = $response['data']['token'];
            $_SESSION['api_user'] = $response['data']['usuario'];
            $this->token = $response['data']['token'];
        }
        
        return $response;
    }
    
    /**
     * Registrar nuevo usuario
     * @param array $userData Datos del usuario
     * @return array
     */
    public function registrar($userData) {
        return $this->request('POST', '/auth/registro', $userData);
    }
    
    /**
     * Obtener todas las plantas
     * @return array
     */
    public function obtenerPlantas() {
        $response = $this->request('GET', '/plantas');
        
        if ($response['success'] && isset($response['data']['plantas'])) {
            return [
                'success' => true,
                'plantas' => $response['data']['plantas']
            ];
        }
        
        return $response;
    }
    
    /**
     * Obtener una planta por ID
     * @param int $id ID de la planta
     * @return array
     */
    public function obtenerPlantaPorId($id) {
        return $this->request('GET', '/plantas/' . $id);
    }
    
    /**
     * Obtener una planta por nombre (buscar en todas las plantas)
     * @param string $nombre Nombre de la planta
     * @return array|null Planta encontrada o null
     */
    public function obtenerPlantaPorNombre($nombre) {
        $response = $this->obtenerPlantas();
        
        if ($response['success']) {
            foreach ($response['plantas'] as $planta) {
                if (strtolower($planta['nombre']) === strtolower($nombre)) {
                    return $planta;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Crear nueva planta (requiere autenticación admin)
     * @param array $plantaData Datos de la planta
     * @param string|null $imagenPath Ruta al archivo de imagen (opcional)
     * @return array
     */
    public function crearPlanta($plantaData, $imagenPath = null) {
        // Si hay imagen, usar multipart/form-data
        if ($imagenPath && file_exists($imagenPath)) {
            return $this->requestWithFile('POST', '/plantas', $plantaData, $imagenPath);
        }
        
        return $this->request('POST', '/plantas', $plantaData, true);
    }
    
    /**
     * Actualizar planta (requiere autenticación admin)
     * @param int $id ID de la planta
     * @param array $plantaData Datos actualizados
     * @param string|null $imagenPath Ruta al archivo de imagen (opcional)
     * @return array
     */
    public function actualizarPlanta($id, $plantaData, $imagenPath = null) {
        if ($imagenPath && file_exists($imagenPath)) {
            return $this->requestWithFile('PUT', '/plantas/' . $id, $plantaData, $imagenPath);
        }
        
        return $this->request('PUT', '/plantas/' . $id, $plantaData, true);
    }
    
    /**
     * Eliminar planta (requiere autenticación admin)
     * @param int $id ID de la planta
     * @return array
     */
    public function eliminarPlanta($id) {
        return $this->request('DELETE', '/plantas/' . $id, null, true);
    }
    
    /**
     * Obtener solicitudes del usuario actual o todas (si es admin)
     * @return array
     */
    public function obtenerSolicitudes() {
        return $this->request('GET', '/solicitudes', null, true);
    }
    
    /**
     * Crear nueva solicitud
     * @param array $solicitudData Datos de la solicitud
     * @return array
     */
    public function crearSolicitud($solicitudData) {
        return $this->request('POST', '/solicitudes', $solicitudData, true);
    }
    
    /**
     * Actualizar estatus de solicitud (solo admin)
     * @param int $id ID de la solicitud
     * @param string $estatus Nuevo estatus
     * @param string|null $comentarios Comentarios del admin
     * @return array
     */
    public function actualizarEstatusSolicitud($id, $estatus, $comentarios = null) {
        $data = ['estatus' => $estatus];
        if ($comentarios !== null) {
            $data['comentarios'] = $comentarios;
        }
        return $this->request('PUT', '/solicitudes/' . $id . '/estatus', $data, true);
    }
    
    /**
     * Petición con archivo (multipart/form-data)
     * @param string $method
     * @param string $endpoint
     * @param array $data
     * @param string $filePath
     * @return array
     */
    private function requestWithFile($method, $endpoint, $data, $filePath) {
        $url = rtrim($this->apiBaseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        // Preparar datos para multipart
        $postData = [];
        foreach ($data as $key => $value) {
            $postData[$key] = $value;
        }
        
        // Agregar archivo
        $postData['imagen'] = new CURLFile($filePath, mime_content_type($filePath), basename($filePath));
        
        $ch = curl_init($url);
        
        $headers = [];
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 60, // Más tiempo para uploads
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => 'Error de conexión: ' . $error,
                'http_code' => 0
            ];
        }
        
        $responseData = json_decode($response, true);
        $success = ($httpCode >= 200 && $httpCode < 300);
        
        return [
            'success' => $success,
            'data' => $responseData,
            'http_code' => $httpCode,
            'error' => $success ? null : ($responseData['error'] ?? 'Error desconocido')
        ];
    }
    
    /**
     * Cerrar sesión (limpiar token)
     */
    public function logout() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            unset($_SESSION['api_token']);
            unset($_SESSION['api_user']);
        }
        $this->token = null;
    }
    
    /**
     * Verificar si el usuario está autenticado
     * @return bool
     */
    public function estaAutenticado() {
        return !empty($this->token);
    }
    
    /**
     * Obtener el token actual
     * @return string|null
     */
    public function getToken() {
        return $this->token;
    }
}

