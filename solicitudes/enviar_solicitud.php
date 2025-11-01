<?php
session_start();

// Verificar que el usuario esté logueado y sea usuario común
if (!isset($_SESSION['mail']) || $_SESSION['tipo'] != 0) {
    header("Location: ../index.php");
    exit;
}

include('../configuracion/conexion.php');

// Obtener datos del formulario
$usuario = $_SESSION['usuario'];
$nombre_planta = $_POST['nombre_planta'];
$descripcion_planta = $_POST['descripcion_planta'];
$propiedades_medicinales = $_POST['propiedades_medicinales'];
$ubicacion = $_POST['ubicacion'];
$motivo_donacion = $_POST['motivo_donacion'];
// Configurar zona horaria para México
date_default_timezone_set('America/Mexico_City');
$fecha_solicitud = date('Y-m-d H:i:s');
$estatus = 'Pendiente'; // Por defecto pendiente

// Insertar la solicitud en la base de datos
$sql = "INSERT INTO solicitudes_donacion (usuario, nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion, fecha_solicitud, estatus) 
        VALUES ('$usuario', '$nombre_planta', '$descripcion_planta', '$propiedades_medicinales', '$ubicacion', '$motivo_donacion', '$fecha_solicitud', '$estatus')";

$resultado = mysqli_query($conexion, $sql);

if($resultado){
    echo "<script>alert('Solicitud enviada correctamente. El administrador la revisará pronto.'); window.location='../index.php';</script>";
} else {
    echo "<script>alert('Error al enviar la solicitud. Inténtalo de nuevo.'); window.location='../index.php';</script>";
}
?> 