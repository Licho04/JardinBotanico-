<?php
include('../configuracion/conexion.php');
$sql = "SELECT id, usuario, nombre_planta, descripcion_planta, propiedades_medicinales, ubicacion, motivo_donacion, fecha_solicitud, estatus, respuesta_admin, fecha_respuesta 
        FROM solicitudes_donacion 
        ORDER BY fecha_solicitud DESC";
$result = mysqli_query($conexion, $sql);
?>
<h2>Solicitudes de Donación de Plantas</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
    <tr>
        <th>Usuario</th>
        <th>Planta</th>
        <th>Descripción</th>
        <th>Propiedades</th>
        <th>Ubicación</th>
        <th>Motivo</th>
        <th>Fecha</th>
        <th>Estatus</th>
        <th>Acciones</th>
    </tr>
    <?php while($row = mysqli_fetch_assoc($result)): ?>
    <tr>
        <td><?php echo htmlspecialchars($row['usuario']); ?></td>
        <td><?php echo htmlspecialchars($row['nombre_planta']); ?></td>
        <td><?php echo htmlspecialchars(substr($row['descripcion_planta'], 0, 50)) . (strlen($row['descripcion_planta']) > 50 ? '...' : ''); ?></td>
        <td><?php echo htmlspecialchars(substr($row['propiedades_medicinales'], 0, 50)) . (strlen($row['propiedades_medicinales']) > 50 ? '...' : ''); ?></td>
        <td><?php echo htmlspecialchars($row['ubicacion']); ?></td>
        <td><?php echo htmlspecialchars(substr($row['motivo_donacion'], 0, 50)) . (strlen($row['motivo_donacion']) > 50 ? '...' : ''); ?></td>
        <td><?php echo date('d/m/Y H:i', strtotime($row['fecha_solicitud'])); ?></td>
        <td>
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8em; 
                background-color: <?php 
                    echo $row['estatus'] == 'Aprobada' ? '#d4edda' : 
                         ($row['estatus'] == 'Rechazada' ? '#f8d7da' : '#fff3cd'); 
                ?>; 
                color: <?php 
                    echo $row['estatus'] == 'Aprobada' ? '#155724' : 
                         ($row['estatus'] == 'Rechazada' ? '#721c24' : '#856404'); 
                ?>;">
                <?php echo htmlspecialchars($row['estatus']); ?>
            </span>
        </td>
        <td>
            <button class="btn-responder-solicitud" data-id="<?php echo $row['id']; ?>">
                <?php echo $row['estatus'] == 'Pendiente' ? 'Responder' : 'Ver/Editar'; ?>
            </button>
        </td>
    </tr>
    <?php endwhile; ?>
</table>

<script>
// Cerrar modal al hacer clic fuera
document.getElementById('modal-responder-solicitud').onclick = function(e){
    if(e.target === this) this.style.display = 'none';
};
</script> 