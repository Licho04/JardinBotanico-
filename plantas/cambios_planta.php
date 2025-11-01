<?php
include('../configuracion/conexion.php');
$nombre_original = $_POST['nombre_original'];
$nombre = $_POST['nombre'];
$nombre_cientifico = $_POST['nombre_cientifico'];
$descripcion = $_POST['descripcion'];
$propiedades = $_POST['propiedades'];
$zona_geografica = $_POST['zona_geografica'];
$usos = $_POST['usos'];

// Manejo de imagen
$imagen = '';
if(isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0){
    $nombre_img = basename($_FILES['imagen']['name']);
    $ruta = "../recursos/imagenes/" . $nombre_img;
    
    // Verificar que la carpeta image existe
    if (!is_dir('../recursos/imagenes')) {
        mkdir('../recursos/imagenes', 0755, true);
    }
    
    if(move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)){
        $imagen = $nombre_img;
    } else {
        echo "<script>alert('Error al subir la imagen. Verifica que la carpeta image tenga permisos de escritura.'); window.location='../administracion/admin.php?vista=plantas';</script>";
        exit;
    }
}

$sql = "UPDATE plantas SET 
    nombre = '$nombre',
    nombre_cientifico = '$nombre_cientifico',
    descripcion = '$descripcion',
    propiedades = '$propiedades',
    zona_geografica = '$zona_geografica',
    usos = '$usos'";

if($imagen != ''){
    $sql .= ", imagen = '$imagen'";
}
$sql .= " WHERE nombre = '$nombre_original'";

$resultado = mysqli_query($conexion, $sql);

if($resultado){
    echo "<script>alert('Planta actualizada correctamente'); window.location='../administracion/admin.php?vista=plantas';</script>";
} else {
    echo "<script>alert('Error al actualizar planta'); window.location='../administracion/admin.php?vista=plantas';</script>";
}
?>
