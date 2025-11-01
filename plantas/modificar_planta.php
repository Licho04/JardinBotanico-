<?php
include('../configuracion/conexion.php');
$nombre = $_POST['nombre'];
$sql = "SELECT * FROM plantas WHERE nombre = '$nombre'";
$res = mysqli_query($conexion, $sql);
if(mysqli_num_rows($res) == 0){
    echo "No se encuentra la planta";
} else {
    $fila = mysqli_fetch_assoc($res);
    ?>
    <h2>Modificar planta</h2>
    <form action="cambios_planta.php" method="post" enctype="multipart/form-data">
        <input type="hidden" name="nombre_original" value="<?php echo htmlspecialchars($fila['nombre']); ?>">
        <label>Nombre: <input type="text" name="nombre" value="<?php echo htmlspecialchars($fila['nombre']); ?>" required></label><br>
        <label>Nombre científico: <input type="text" name="nombre_cientifico" value="<?php echo htmlspecialchars($fila['nombre_cientifico']); ?>" required></label><br>
        <label>Descripción: <textarea name="descripcion" required><?php echo htmlspecialchars($fila['descripcion']); ?></textarea></label><br>
        <label>Propiedades: <textarea name="propiedades" required><?php echo htmlspecialchars($fila['propiedades']); ?></textarea></label><br>
        <label>Zona geográfica: <input type="text" name="zona_geografica" value="<?php echo htmlspecialchars($fila['zona_geografica']); ?>" required></label><br>
        <label>Usos: <input type="text" name="usos" value="<?php echo htmlspecialchars($fila['usos']); ?>" required></label><br>
        <label>Imagen actual: 
            <?php if($fila['imagen']): ?>
                <img src="image/<?php echo htmlspecialchars($fila['imagen']); ?>" alt="Imagen" style="max-width:60px;max-height:60px;">
            <?php else: ?>
                Sin imagen
            <?php endif; ?>
        </label><br>
        <label>Nueva imagen: <input type="file" name="imagen"></label><br>
        <button type="submit">Guardar cambios</button>
        <button type="button" onclick="document.getElementById('modal-editar-planta').style.display='none'">Cancelar</button>
    </form>
    <?php
}
?>
