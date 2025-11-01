<?php
session_start();

// Verificar que el usuario esté logueado y sea usuario común (no admin)
if (!isset($_SESSION['mail']) || $_SESSION['tipo'] == 1) {
    header("Location: ../index.php");
    exit;
}

include('../configuracion/conexion.php');

$usuario = $_SESSION['usuario'];
$sql = "SELECT * FROM solicitudes_donacion WHERE usuario = '$usuario' ORDER BY fecha_solicitud DESC";
$result = mysqli_query($conexion, $sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Solicitudes - Jardín Botánico</title>
    <link rel="stylesheet" href="../recursos/estilos/styles.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .solicitudes-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .solicitud-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #4b6e3c;
        }
        
        .solicitud-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .solicitud-titulo {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d4c2a;
        }
        
        .solicitud-estatus {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .estatus-pendiente {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .estatus-aprobada {
            background-color: #d4edda;
            color: #155724;
        }
        
        .estatus-rechazada {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .solicitud-detalles {
            margin-bottom: 15px;
        }
        
        .solicitud-detalles p {
            margin: 5px 0;
            color: #666;
        }
        
        .solicitud-detalles strong {
            color: #2d4c2a;
        }
        
        .respuesta-admin {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        
        .respuesta-admin h4 {
            color: #2d4c2a;
            margin-bottom: 10px;
        }
        
        .btn-volver {
            background: #4b6e3c;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            transition: background 0.3s;
        }
        
        .btn-volver:hover {
            background: #2d4c2a;
        }
        
        .sin-solicitudes {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <header class="encabezado">
        <div class="encabezado-izquierda">
            <img src="../recursos/imagenes/logo_transparente.png" alt="Logo Jardín Botánico" class="logo">
            <h1 class="titulo">Jardín Botánico</h1>
        </div>
        <nav class="navegacion">
            <a href="../index.php">Inicio</a>
            <a href="historia.php">Historia</a>
            <div class="menu-hamburguesa">
                <button id="btn-menu">&#9776;</button>
                <div id="menu-opciones" style="display: none;">
                    <a href="perfil.php">Perfil</a>
                    <?php if($_SESSION['tipo'] == 1): ?>
                        <a href="../administracion/admin.php">Administrador</a>
                    <?php endif; ?>
                    <a href="../autenticacion/cerrar_sesion.php">Cerrar sesión</a>
                </div>
            </div>
        </nav>
    </header>

    <main class="contenido-principal">
        <div class="solicitudes-container">
            <h1><i class="fas fa-seedling"></i> Mis Solicitudes de Donación</h1>
            
            <?php if(mysqli_num_rows($result) > 0): ?>
                <?php while($solicitud = mysqli_fetch_assoc($result)): ?>
                    <div class="solicitud-card">
                        <div class="solicitud-header">
                            <div class="solicitud-titulo">
                                <?php echo htmlspecialchars($solicitud['nombre_planta']); ?>
                            </div>
                            <div class="solicitud-estatus estatus-<?php echo strtolower($solicitud['estatus']); ?>">
                                <?php echo htmlspecialchars($solicitud['estatus']); ?>
                            </div>
                        </div>
                        
                        <div class="solicitud-detalles">
                            <p><strong>Descripción:</strong> <?php echo htmlspecialchars($solicitud['descripcion_planta']); ?></p>
                            <p><strong>Propiedades medicinales:</strong> <?php echo htmlspecialchars($solicitud['propiedades_medicinales']); ?></p>
                            <p><strong>Ubicación:</strong> <?php echo htmlspecialchars($solicitud['ubicacion']); ?></p>
                            <p><strong>Motivo de donación:</strong> <?php echo htmlspecialchars($solicitud['motivo_donacion']); ?></p>
                            <p><strong>Fecha de solicitud:</strong> <?php echo date('d/m/Y H:i', strtotime($solicitud['fecha_solicitud'])); ?></p>
                        </div>
                        
                        <?php if($solicitud['respuesta_admin']): ?>
                            <div class="respuesta-admin">
                                <h4><i class="fas fa-reply"></i> Respuesta del Administrador</h4>
                                <p><?php echo htmlspecialchars($solicitud['respuesta_admin']); ?></p>
                                <small>Respondido el: <?php echo date('d/m/Y H:i', strtotime($solicitud['fecha_respuesta'])); ?></small>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="sin-solicitudes">
                    <i class="fas fa-seedling" style="font-size: 3rem; color: #4b6e3c; margin-bottom: 20px;"></i>
                    <h3>No tienes solicitudes de donación</h3>
                    <p>Cuando envíes una solicitud de donación de planta, aparecerá aquí.</p>
                </div>
            <?php endif; ?>
            
            <a href="perfil.php" class="btn-volver">
                <i class="fas fa-arrow-left"></i> Volver al Perfil
            </a>
        </div>
    </main>

    <footer class="pie-pagina">
        <div class="redes-sociales">
            <a href="https://www.facebook.com/ujat.mx" class="icono-red-social">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/UJAT" class="icono-red-social">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="http://www.youtube.com/user/UJATmx" class="icono-red-social">
                <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/ujat/" class="icono-red-social">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.ujat.mx/Contenido/Interior/348" class="icono-red-social">
                <i class="fas fa-envelope"></i>
            </a>
            <a href="https://www.ujat.tv/" class="icono-red-social">
                <i class="fas fa-desktop"></i>
            </a>
            <a href="https://www.ujat.mx/Search" class="icono-red-social">
                <i class="fas fa-search"></i>
            </a>
        </div>
        <div class="informacion-contacto">
            <p>Av. Universidad s/n, Zona de la Cultura, Col. Magisterial, Vhsa, Centro, Tabasco, Mex. C.P. 86040.</p>
            <p>Tel (993) 358 15 00</p>
        </div>
    </footer>

    <script>
    var btnMenu = document.getElementById('btn-menu');
    if(btnMenu){
        btnMenu.onclick = function() {
            var menu = document.getElementById('menu-opciones');
            if(menu.style.display === 'flex'){
                menu.style.display = 'none';
            } else {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'column';
            }
        };
    }
    </script>
</body>
</html> 