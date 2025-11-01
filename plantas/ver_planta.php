<?php
include('../configuracion/conexion.php');

// Verificar si se proporcionó el nombre de la planta
if (!isset($_GET['nombre']) || empty($_GET['nombre'])) {
    header("Location: ../index.php");
    exit;
}

$nombre_planta = $_GET['nombre'];

// Consultar información detallada de la planta
$sql = "SELECT * FROM plantas WHERE nombre = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $nombre_planta);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    header("Location: ../index.php");
    exit;
}

$planta = $resultado->fetch_assoc();
$stmt->close();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($planta['nombre']); ?> - Plantas Medicinales</title>
    <link rel="stylesheet" href="../recursos/estilos/styles.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="encabezado">
        <div class="encabezado-izquierda">
            <img src="../recursos/imagenes/logo_transparente.png" alt="Logo Plantas Medicinales" class="logo">
            <div>
                <h1 class="titulo">Plantas Medicinales</h1>
            </div>
        </div>
        <nav class="navegacion">
            <a href="../index.php">Inicio</a>
            <a href="../usuario/historia.php">Historia</a>
            <?php if(!isset($_SESSION['mail'])): ?>
                <a href="../autenticacion/inicio_sesion.html">Iniciar Sesión</a>
            <?php else: ?>
                <?php if($_SESSION['tipo'] == 1): ?>
                    <a href="../administracion/admin.php">Administración</a>
                <?php endif; ?>
                <a href="../usuario/perfil.php">Perfil</a>
                <a href="../autenticacion/cerrar_sesion.php">Cerrar Sesión</a>
            <?php endif; ?>
        </nav>
    </header>

    <main class="planta-individual-container">
        <div class="breadcrumb">
            <a href="../index.php"><i class="fas fa-home"></i> Inicio</a>
            <span><i class="fas fa-chevron-right"></i></span>
            <span><?php echo htmlspecialchars($planta['nombre']); ?></span>
        </div>

        <div class="planta-header">
            <div class="planta-imagen">
                <?php if($planta['imagen']): ?>
                    <img src="../recursos/imagenes/<?php echo htmlspecialchars($planta['imagen']); ?>" 
                         alt="<?php echo htmlspecialchars($planta['nombre']); ?>" 
                         class="imagen-principal">
                <?php else: ?>
                    <div class="imagen-placeholder">
                        <i class="fas fa-leaf"></i>
                        <span>Sin imagen</span>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="planta-info-basica">
                <h1 class="nombre-planta"><?php echo htmlspecialchars($planta['nombre']); ?></h1>
                <h2 class="nombre-cientifico"><i><?php echo htmlspecialchars($planta['nombre_cientifico']); ?></i></h2>
                
                <div class="info-tags">
                    <span class="tag zona">
                        <i class="fas fa-map-marker-alt"></i>
                        <?php echo htmlspecialchars($planta['zona_geografica']); ?>
                    </span>
                </div>
            </div>
        </div>

        <div class="planta-contenido">
            <div class="seccion">
                <h3><i class="fas fa-info-circle"></i> Descripción</h3>
                <div class="contenido">
                    <?php if($planta['descripcion']): ?>
                        <p><?php echo nl2br(htmlspecialchars($planta['descripcion'])); ?></p>
                    <?php else: ?>
                        <p class="sin-informacion">No hay descripción disponible.</p>
                    <?php endif; ?>
                </div>
            </div>

            <div class="seccion">
                <h3><i class="fas fa-flask"></i> Propiedades Medicinales</h3>
                <div class="contenido">
                    <?php if($planta['propiedades']): ?>
                        <p><?php echo nl2br(htmlspecialchars($planta['propiedades'])); ?></p>
                    <?php else: ?>
                        <p class="sin-informacion">No hay información sobre propiedades medicinales.</p>
                    <?php endif; ?>
                </div>
            </div>

            <div class="seccion">
                <h3><i class="fas fa-tools"></i> Usos Tradicionales</h3>
                <div class="contenido">
                    <?php if($planta['usos']): ?>
                        <p><?php echo nl2br(htmlspecialchars($planta['usos'])); ?></p>
                    <?php else: ?>
                        <p class="sin-informacion">No hay información sobre usos tradicionales.</p>
                    <?php endif; ?>
                </div>
            </div>

            <?php if($planta['informacion_adicional']): ?>
            <div class="seccion">
                <h3><i class="fas fa-book"></i> Información Adicional</h3>
                <div class="contenido">
                    <p><?php echo nl2br(htmlspecialchars($planta['informacion_adicional'])); ?></p>
                </div>
            </div>
            <?php endif; ?>

            <?php if($planta['precauciones']): ?>
            <div class="seccion precauciones">
                <h3><i class="fas fa-exclamation-triangle"></i> Precauciones</h3>
                <div class="contenido">
                    <p><?php echo nl2br(htmlspecialchars($planta['precauciones'])); ?></p>
                </div>
            </div>
            <?php endif; ?>
        </div>

        <div class="acciones-planta">
            <a href="../index.php" class="btn btn-secundario">
                <i class="fas fa-arrow-left"></i> Volver al Catálogo
            </a>
            
            <?php if(isset($_SESSION['tipo']) && $_SESSION['tipo'] == 1): ?>
                <a href="../administracion/admin.php?vista=plantas" class="btn btn-admin">
                    <i class="fas fa-edit"></i> Editar Información
                </a>
            <?php endif; ?>
        </div>
    </main>

    <footer class="pie-pagina">
        <div class="contenido-pie">
            <div class="seccion-pie">
                <h4><i class="fas fa-leaf"></i> Plantas Medicinales</h4>
                <p>Catálogo científico especializado en plantas medicinales y sus propiedades terapéuticas.</p>
            </div>
            <div class="seccion-pie">
                <h4>Enlaces Rápidos</h4>
                <ul>
                    <li><a href="../index.php">Catálogo</a></li>
                    <li><a href="../usuario/historia.php">Historia</a></li>
                </ul>
            </div>
            <div class="seccion-pie">
                <h4>Contacto</h4>
                <p><strong>Plantas Medicinales - UJAT</strong></p>
                <p>Av. Universidad s/n, Zona de la Cultura, Col. Magisterial, Villahermosa, Centro, Tabasco, México. C.P. 86040</p>
                <p>Teléfono: (993) 358 15 00 | Email: info@ujat.mx</p>
            </div>
        </div>
        <div class="copyright">
            <p>&copy; 2025 Plantas Medicinales UJAT. Todos los derechos reservados.</p>
        </div>
    </footer>
</body>
</html>