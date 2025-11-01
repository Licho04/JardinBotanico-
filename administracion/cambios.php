<?php
include('../configuracion/conexion.php');
$us = $_POST['usuario'];
$usuario_original = $_POST['usuario_original'];
$nombre = $_POST['nombre'];
$mail = $_POST['mail'];
$pas = $_POST['password'];
$tipo = $_POST['tipo'];

// Verificar si el correo ya existe en otro usuario
$verificar_correo = "SELECT mail FROM usuarios WHERE mail = '".$mail."' AND usuario != '".$usuario_original."'";
$resultado_correo = mysqli_query($conexion, $verificar_correo);

if(mysqli_num_rows($resultado_correo) > 0) {
    echo "<script>alert('Error: El correo electrónico ya está registrado por otro usuario'); window.location='admin.php?vista=usuarios';</script>";
    exit;
}

$cadenasql = "UPDATE usuarios SET nombre = '".$nombre."', mail = '".$mail."', password = '".$pas."', tipo = '".$tipo."' WHERE usuario = '".$us."';";
$resultado = mysqli_query($conexion,$cadenasql);

if($resultado) {
    echo "<script>alert('Cambios realizados'); window.location='admin.php?vista=usuarios';</script>";
} else {
    echo "<script>alert('Error al actualizar'); window.location='admin.php?vista=usuarios';</script>";
}
?>