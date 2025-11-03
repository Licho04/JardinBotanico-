<?php
session_start();
require_once 'config_api_render.php';

$error = '';
$success = '';

// Procesar login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $usuario = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($usuario) && !empty($password)) {
        $resultado = login_usuario($usuario, $password);

        if (isset($resultado['token']) && isset($resultado['usuario'])) {
            // Login exitoso - verificar que usuario sea un array
            if (is_array($resultado['usuario'])) {
                guardar_token($resultado['token']);
                guardar_usuario($resultado['usuario']);
                $success = '¡Login exitoso! Bienvenido ' . htmlspecialchars($resultado['usuario']['nombre'] ?: $resultado['usuario']['usuario']);
            } else {
                $error = 'Error: formato de respuesta inválido';
            }
        } else {
            $error = $resultado['error'] ?? 'Error al iniciar sesión';
        }
    } else {
        $error = 'Por favor complete todos los campos';
    }
}

// Cerrar sesión
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    cerrar_sesion_api();
    header('Location: test_api_login.php');
    exit;
}

$usuario_actual = obtener_usuario();
$esta_logueado = tiene_token() && is_array($usuario_actual);

// Si hay token pero usuario no es array, limpiar sesión corrupta
if (tiene_token() && !is_array($usuario_actual)) {
    cerrar_sesion_api();
    $esta_logueado = false;
    $usuario_actual = null;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Jardín Botánico</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 500px;
            width: 100%;
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        h1 {
            color: #2d3748;
            margin-bottom: 10px;
            text-align: center;
        }

        .subtitle {
            text-align: center;
            color: #718096;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            color: #2d3748;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #cbd5e0;
            border-radius: 5px;
            font-size: 16px;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }

        .btn:hover {
            background: #5568d3;
        }

        .btn-logout {
            background: #f56565;
        }

        .btn-logout:hover {
            background: #e53e3e;
        }

        .error {
            background: #fed7d7;
            border-left: 4px solid #f56565;
            padding: 15px;
            border-radius: 5px;
            color: #742a2a;
            margin-bottom: 20px;
        }

        .success {
            background: #c6f6d5;
            border-left: 4px solid #48bb78;
            padding: 15px;
            border-radius: 5px;
            color: #22543d;
            margin-bottom: 20px;
        }

        .user-info {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }

        .user-info strong {
            color: #234e52;
        }

        .links {
            text-align: center;
            margin-top: 20px;
        }

        .links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }

        .links a:hover {
            text-decoration: underline;
        }

        .credential-hint {
            background: #fefcbf;
            border-left: 4px solid #d69e2e;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌿 Jardín Botánico</h1>
        <div class="subtitle">Sistema de Gestión</div>

        <?php if ($error): ?>
            <div class="error">
                <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="success">
                <?php echo htmlspecialchars($success); ?>
            </div>
        <?php endif; ?>

        <?php if ($esta_logueado): ?>
            <div class="user-info">
                <strong>Usuario:</strong> <?php echo htmlspecialchars($usuario_actual['usuario']); ?><br>
                <strong>Nombre:</strong> <?php echo htmlspecialchars($usuario_actual['nombre'] ?: 'No especificado'); ?><br>
                <strong>Email:</strong> <?php echo htmlspecialchars($usuario_actual['mail']); ?><br>
                <strong>Tipo:</strong> <?php echo $usuario_actual['tipo'] == 1 ? 'Administrador' : 'Usuario'; ?>
            </div>

            <form method="GET">
                <input type="hidden" name="action" value="logout">
                <button type="submit" class="btn btn-logout">Cerrar Sesión</button>
            </form>

            <div class="links">
                <a href="test_api_plantas.php">Ver Plantas</a>
                <a href="index.php">Ir al inicio</a>
            </div>
        <?php else: ?>
            <div class="credential-hint">
                <strong>💡 Credenciales de prueba:</strong><br>
                Usuario: <strong>Licho</strong><br>
                Password: <strong>1412</strong>
            </div>

            <form method="POST">
                <input type="hidden" name="action" value="login">

                <div class="form-group">
                    <label for="usuario">Usuario o Email:</label>
                    <input type="text" id="usuario" name="usuario" required>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <button type="submit" class="btn">Iniciar Sesión</button>
            </form>

            <div class="links">
                <a href="test_api_plantas.php">Ver Plantas (público)</a>
                <a href="index.php">Ir al inicio</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
