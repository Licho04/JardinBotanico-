<?php
include('../configuracion/conexion.php');

$id = $_POST['id'];
$sql = "SELECT * FROM solicitudes_donacion WHERE id = '$id'";
$result = mysqli_query($conexion, $sql);
$solicitud = mysqli_fetch_assoc($result);

if($solicitud) {
?>
    <h2>Responder Solicitud de Donación</h2>
    <form action="procesar_respuesta.php" method="post">
        <input type="hidden" name="id" value="<?php echo $solicitud['id']; ?>">
        
        <div style="margin-bottom: 20px;">
            <h3>Detalles de la Solicitud:</h3>
            <p><strong>Usuario:</strong> <?php echo htmlspecialchars($solicitud['usuario']); ?></p>
            <p><strong>Planta:</strong> <?php echo htmlspecialchars($solicitud['nombre_planta']); ?></p>
            <p><strong>Descripción:</strong> <?php echo htmlspecialchars($solicitud['descripcion_planta']); ?></p>
            <p><strong>Propiedades:</strong> <?php echo htmlspecialchars($solicitud['propiedades_medicinales']); ?></p>
            <p><strong>Ubicación:</strong> <?php echo htmlspecialchars($solicitud['ubicacion']); ?></p>
            <p><strong>Motivo:</strong> <?php echo htmlspecialchars($solicitud['motivo_donacion']); ?></p>
            <p><strong>Fecha de solicitud:</strong> <?php echo date('d/m/Y H:i', strtotime($solicitud['fecha_solicitud'])); ?></p>
            <p><strong>Estatus actual:</strong> <?php echo htmlspecialchars($solicitud['estatus']); ?></p>
        </div>
        
        <label>
            Estatus:
            <select name="estatus" required>
                <option value="Pendiente" <?php echo $solicitud['estatus'] == 'Pendiente' ? 'selected' : ''; ?>>Pendiente</option>
                <option value="Aprobada" <?php echo $solicitud['estatus'] == 'Aprobada' ? 'selected' : ''; ?>>Aprobada</option>
                <option value="Rechazada" <?php echo $solicitud['estatus'] == 'Rechazada' ? 'selected' : ''; ?>>Rechazada</option>
            </select>
        </label>
        
        <label>
            Respuesta del administrador:
            <textarea name="respuesta_admin" required placeholder="Escribe tu respuesta al usuario..."><?php echo htmlspecialchars($solicitud['respuesta_admin'] ?? ''); ?></textarea>
        </label>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit">Guardar Respuesta</button>
            <button type="button" onclick="document.getElementById('modal-responder-solicitud').style.display='none'">Cancelar</button>
        </div>
    </form>
<?php
} else {
    echo "<p>Error: No se encontró la solicitud.</p>";
}
?> 