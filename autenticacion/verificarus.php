<?php
//VERIFICAR USUARIO - Usa API Node.js

include('../configuracion/conexion.php');

$identificador = $_POST['identificador']; // Puede ser usuario o correo
$pass = $_POST['password'];

// Si está usando API
if (defined('USAR_API') && USAR_API && $conexion instanceof ApiClient) {
    $response = $conexion->login($identificador, $pass);
    
    if ($response['success'] && isset($response['data']['usuario'])) {
        session_start();
        $user = $response['data']['usuario'];
        $_SESSION['mail'] = $user['mail'];
        $_SESSION['usuario'] = $user['usuario'];
        $_SESSION['tipo'] = $user['tipo'];
        // Guardar token para futuras peticiones
        $_SESSION['api_token'] = $response['data']['token'];
        
        header("Location: ../index.php");
        exit;
    } else {
        echo "<br>Error: Usuario/correo o contraseña incorrectos...<br>";
        if (isset($response['error'])) {
            echo "Detalle: " . htmlspecialchars($response['error']) . "<br>";
        }
        echo '<a href="inicio_sesion.html">Volver a intentar</a>';
    }
} else {
    // Modo conexión directa (MySQL) - código original
    $cadenasql = "SELECT * FROM usuarios WHERE (usuario = '".$identificador."' OR mail = '".$identificador."') AND password = '".$pass."';";
    $resultado = mysqli_query($conexion, $cadenasql);
    
    if(mysqli_num_rows($resultado) > 0) {
        session_start();
        $fila = mysqli_fetch_assoc($resultado);
        $_SESSION['mail'] = $fila['mail'];
        $_SESSION['usuario'] = $fila['usuario'];
        $_SESSION['tipo'] = $fila['tipo'];
        header("Location: ../index.php");
        exit;
    } else {
        echo "<br>Error: Usuario/correo o contraseña incorrectos...<br>";
        echo '<a href="inicio_sesion.html">Volver a intentar</a>';
    }
}
?>