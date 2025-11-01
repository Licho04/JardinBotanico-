<?php
session_start();

// Verificar que el usuario esté logueado y sea administrador
if (!isset($_SESSION['mail']) || $_SESSION['tipo'] != 1) {
    header("Location: ../index.php");
    exit;
}

include('../configuracion/conexion.php');

$id = $_POST['id'];
$estatus = $_POST['estatus'];
$respuesta_admin = $_POST['respuesta_admin'];
// Configurar zona horaria para México
date_default_timezone_set('America/Mexico_City');
$fecha_respuesta = date('Y-m-d H:i:s');

// Actualizar la solicitud
$sql = "UPDATE solicitudes_donacion 
        SET estatus = '$estatus', respuesta_admin = '$respuesta_admin', fecha_respuesta = '$fecha_respuesta' 
        WHERE id = '$id'";

$resultado = mysqli_query($conexion, $sql);

if($resultado){
    echo "<script>alert('Respuesta guardada correctamente'); window.location='../administracion/admin.php?vista=solicitudes';</script>";
} else {
    echo "<script>alert('Error al guardar la respuesta'); window.location='../administracion/admin.php?vista=solicitudes';</script>";
}
?> 