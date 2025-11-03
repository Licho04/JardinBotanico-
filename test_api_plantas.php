<?php
session_start();
require_once 'config_api_render.php';

// Obtener todas las plantas desde la API
$resultado = obtener_plantas();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantas - Jardín Botánico</title>
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
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        h1 {
            color: #2d3748;
            margin-bottom: 10px;
        }

        .stats {
            color: #718096;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .api-info {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }

        .api-info strong {
            color: #234e52;
        }

        .plantas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .planta-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .planta-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .planta-nombre {
            font-size: 20px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .planta-cientifico {
            font-style: italic;
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .planta-descripcion {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .planta-propiedades {
            background: #f7fafc;
            padding: 10px;
            border-radius: 5px;
            font-size: 13px;
            color: #4a5568;
        }

        .planta-propiedades strong {
            color: #2d3748;
        }

        .error {
            background: #fed7d7;
            border-left: 4px solid #f56565;
            padding: 15px;
            border-radius: 5px;
            color: #742a2a;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        .btn:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌿 Jardín Botánico - Catálogo de Plantas</h1>

        <div class="api-info">
            <strong>✓ API Conectada:</strong> https://jardinbotanico-0qiz.onrender.com/api/plantas
        </div>

        <?php if (isset($resultado['error'])): ?>
            <div class="error">
                <strong>Error:</strong> <?php echo htmlspecialchars($resultado['mensaje'] ?? 'Error al conectar con la API'); ?>
            </div>
        <?php elseif (isset($resultado['plantas'])): ?>
            <div class="stats">
                Total de plantas: <strong><?php echo $resultado['total']; ?></strong>
            </div>

            <div class="plantas-grid">
                <?php foreach ($resultado['plantas'] as $planta): ?>
                    <div class="planta-card">
                        <div class="planta-nombre">
                            <?php echo htmlspecialchars($planta['nombre']); ?>
                        </div>

                        <?php if (!empty($planta['nombre_cientifico'])): ?>
                            <div class="planta-cientifico">
                                <?php echo htmlspecialchars($planta['nombre_cientifico']); ?>
                            </div>
                        <?php endif; ?>

                        <div class="planta-descripcion">
                            <?php echo htmlspecialchars($planta['descripcion']); ?>
                        </div>

                        <?php if (!empty($planta['propiedades'])): ?>
                            <div class="planta-propiedades">
                                <strong>Propiedades:</strong>
                                <?php echo htmlspecialchars($planta['propiedades']); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="error">
                <strong>Error:</strong> No se pudieron cargar las plantas. Respuesta inesperada de la API.
            </div>
        <?php endif; ?>

        <a href="index.php" class="btn">← Volver al inicio</a>
    </div>
</body>
</html>
