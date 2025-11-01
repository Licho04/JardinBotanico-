<?php
//VERIFICAR USUARIO EN LA BD

include('../configuracion/conexion.php');

$identificador = $_POST['identificador']; // Puede ser usuario o correo
$pass = $_POST['password'];

// Buscar por usuario O correo
$cadenasql = "SELECT * FROM usuarios WHERE (usuario = '".$identificador."' OR mail = '".$identificador."') AND password = '".$pass."';";

$resultado = mysqli_query($conexion, $cadenasql);

if(mysqli_num_rows($resultado) > 0)
{
    session_start();
    $fila = mysqli_fetch_assoc($resultado);
    $_SESSION['mail'] = $fila['mail'];
    $_SESSION['usuario'] = $fila['usuario'];
    $_SESSION['tipo'] = $fila['tipo'];
    // Redirige al inicio
    header("Location: ../index.php");
    exit;
}
else
{
    echo "<br>Error: Usuario/correo o contraseña incorrectos...<br>";
    echo '<a href="inicio_sesion.html">Volver a intentar</a>';
}
?>