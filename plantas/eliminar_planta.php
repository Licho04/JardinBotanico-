<?php
include('../configuracion/conexion.php');
$nombre = $_POST['nombre'];
$sql = "DELETE FROM plantas WHERE nombre = '$nombre'";
$resultado = mysqli_query($conexion, $sql);
echo $resultado ? "ok" : "error";
?>
