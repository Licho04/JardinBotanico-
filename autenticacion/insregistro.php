<?php

include('../configuracion/conexion.php');

$idus = $_POST['usuario'];
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$mail = $_POST['mail'];
$pass = $_POST['password'];

// Si el campo tipo viene en el formulario, se usa, si no, es usuario normal
if (isset($_POST['tipo'])) {
    $tipo = $_POST['tipo'] == '1' ? 1 : 0;
} else {
    $tipo = 0;
}

// Verificar si el usuario ya existe
$verificar_usuario = "SELECT usuario FROM usuarios WHERE usuario = '".$idus."'";
$resultado_usuario = mysqli_query($conexion, $verificar_usuario);

if(mysqli_num_rows($resultado_usuario) > 0) {
    echo "<h1>Error: El nombre de usuario ya está en uso</h1>";
    echo '<a href="registro.html">Volver al registro</a>';
    exit;
}

// Verificar si el correo ya existe
$verificar_correo = "SELECT mail FROM usuarios WHERE mail = '".$mail."'";
$resultado_correo = mysqli_query($conexion, $verificar_correo);

if(mysqli_num_rows($resultado_correo) > 0) {
    echo "<h1>Error: El correo electrónico ya está registrado</h1>";
    echo '<a href="registro.html">Volver al registro</a>';
    exit;
}

// Si no hay duplicados, proceder con el registro
$cadenasql = "INSERT INTO usuarios (usuario, nombre, mail, password, tipo) VALUES('".$idus."','".$nombre."','".$mail."','".$pass."','".$tipo."');";

$resultado = mysqli_query($conexion, $cadenasql);

if($resultado) {
    // Si el registro viene del panel admin, redirige a admin.php
    if (isset($_POST['tipo'])) {
        header("Location: admin.php?vista=usuarios");
        exit;
    } else {
        // Si viene del registro publico, redirige a iniciar sesion
        header("Location: inicio_sesion.html");
        exit;
    }
} else {
    echo "<h1>Error al insertar registro...</h1>";
    echo '<a href="registro.html">Volver al registro</a>';
}

?>