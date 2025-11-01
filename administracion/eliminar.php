<?php
include('../configuracion/conexion.php');
$usuario = $_POST['usuario'];
$cadenasql = "DELETE FROM usuarios WHERE usuario = '".$usuario."'";
$resultado = mysqli_query($conexion, $cadenasql);
echo $resultado ? "ok" : "error";
?>