<?php
include('../configuracion/conexion.php');
$nombre = $_POST['nombre'] ?? '';

// Si está usando API
if (defined('USAR_API') && USAR_API && $conexion instanceof ApiClient) {
    $row = $conexion->obtenerPlantaPorNombre($nombre);
} else {
    // Modo conexión directa (MySQL)
    $sql = "SELECT * FROM plantas WHERE nombre = '$nombre'";
    $res = mysqli_query($conexion, $sql);
    $row = mysqli_fetch_assoc($res);
}

if($row){
    ?>
    <div class="info-planta-container">
        <div class="cientifico-destacado">
            <h3><i class="fas fa-microscope"></i> Información Taxonómica</h3>
        </div>
        
        <h2><?php echo htmlspecialchars($row['nombre']); ?></h2>
        
        <?php if(!empty($row['imagen'])): ?>
            <div class="imagen-planta">
                <img src="recursos/imagenes/<?php echo htmlspecialchars($row['imagen']); ?>" alt="<?php echo htmlspecialchars($row['nombre']); ?>" class="imagen-principal">
            </div>
        <?php endif; ?>
        
        <div class="detalles-planta">
            <p><strong><i class="fas fa-tag"></i> Nomenclatura científica:</strong> <i><?php echo htmlspecialchars($row['nombre_cientifico'] ?? ''); ?></i></p>
            <p><strong><i class="fas fa-file-alt"></i> Descripción morfológica:</strong> <?php echo htmlspecialchars($row['descripcion'] ?? ''); ?></p>
            <p><strong><i class="fas fa-pills"></i> Propiedades farmacológicas:</strong> <?php echo htmlspecialchars($row['propiedades'] ?? ''); ?></p>
            <p><strong><i class="fas fa-globe-americas"></i> Distribución biogeográfica:</strong> <?php echo htmlspecialchars($row['zona_geografica'] ?? ''); ?></p>
            <p><strong><i class="fas fa-heart"></i> Aplicaciones terapéuticas:</strong> <?php echo htmlspecialchars($row['usos'] ?? ''); ?></p>
        </div>
        
        <div class="alert-warning">
            <h4><i class="fas fa-exclamation-triangle"></i> Nota Científica</h4>
            <p>Esta información es de carácter educativo y científico. Para uso medicinal, consulte siempre con un profesional de la salud.</p>
        </div>
    </div>
    <?php
} else {
    echo "<p>No se encontró información de la planta.</p>";
}
?>
