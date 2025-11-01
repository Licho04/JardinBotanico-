<?php
include('../configuracion/conexion.php');
$sql = "SELECT nombre, descripcion, imagen, propiedades, nombre_cientifico, zona_geografica, usos FROM plantas";
$result = mysqli_query($conexion, $sql);
?>
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div>
        <h2 style="color: var(--ujat-azul); margin: 0; font-size: 1.8rem;"><i class="fas fa-seedling"></i> Catálogo Científico de Plantas</h2>
        <p style="color: var(--ujat-texto-claro); margin: 8px 0 0 0;">Gestión del inventario botánico institucional</p>
    </div>
    <button id="btn-agregar-planta" class="boton-nuevo-usuario">
        <i class="fas fa-plus"></i> Agregar Planta
    </button>
</div>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
    <tr>
        <th>Nombre</th>
        <th>Nombre científico</th>
        <th>Descripción</th>
        <th>Propiedades</th>
        <th>Zona geográfica</th>
        <th>Usos</th>
        <th>Imagen</th>
        <th>Acciones</th>
    </tr>
    <?php while($row = mysqli_fetch_assoc($result)): ?>
    <tr>
        <td><?php echo htmlspecialchars($row['nombre']); ?></td>
        <td><i><?php echo htmlspecialchars($row['nombre_cientifico']); ?></i></td>
        <td><?php echo htmlspecialchars($row['descripcion']); ?></td>
        <td><?php echo htmlspecialchars($row['propiedades']); ?></td>
        <td><?php echo htmlspecialchars($row['zona_geografica']); ?></td>
        <td><?php echo htmlspecialchars($row['usos']); ?></td>
        <td>
            <?php if($row['imagen']): ?>
                <img src="../recursos/imagenes/<?php echo htmlspecialchars($row['imagen']); ?>" alt="Imagen" style="max-width:60px;max-height:60px;">
            <?php else: ?>
                Sin imagen
            <?php endif; ?>
        </td>
        <td>
            <button class="btn-modificar-planta"
                data-nombre="<?php echo htmlspecialchars($row['nombre']); ?>"
            >Modificar</button>
            <button class="btn-eliminar-planta"
                data-nombre="<?php echo htmlspecialchars($row['nombre']); ?>"
            >Eliminar</button>
        </td>
    </tr>
    <?php endwhile; ?>
</table>

<!-- Modal para agregar planta -->
<div id="modal-agregar-planta" class="modal" style="display:none;">
    <div class="modal-content" id="modal-content-agregar-planta">
        <h2><i class="fas fa-microscope"></i> Registro Científico de Nueva Planta</h2>
        <div class="alert-info">
            <p><strong>Protocolo Científico:</strong> Complete todos los campos con información verificada y científica.</p>
        </div>
        <form action="../plantas/insplanta.php" method="post" enctype="multipart/form-data">
            <label>
                <i class="fas fa-leaf"></i> Nombre común:
                <input type="text" name="nombre" required placeholder="Ej: Manzanilla, Romero...">
            </label>
            <label>
                <i class="fas fa-tag"></i> Nomenclatura científica:
                <input type="text" name="nombre_cientifico" required placeholder="Ej: Matricaria chamomilla L.">
            </label>
            <label>
                <i class="fas fa-file-alt"></i> Descripción morfológica:
                <textarea name="descripcion" required placeholder="Características físicas, tamaño, forma de hojas, flores, etc."></textarea>
            </label>
            <label>
                <i class="fas fa-pills"></i> Propiedades farmacológicas:
                <textarea name="propiedades" required placeholder="Principios activos, efectos medicinales documentados..."></textarea>
            </label>
            <label>
                <i class="fas fa-globe-americas"></i> Distribución biogeográfica:
                <input type="text" name="zona_geografica" required placeholder="Ej: América del Sur, México, Centroamérica...">
            </label>
            <label>
                <i class="fas fa-heart"></i> Aplicaciones terapéuticas:
                <input type="text" name="usos" required placeholder="Ej: Digestivo, Antiinflamatorio, Sedante...">
            </label>
            <label>
                <i class="fas fa-camera"></i> Fotografía científica:
                <input type="file" name="imagen" accept="image/*">
                <small style="color: var(--ujat-texto-claro); margin-top: 4px; display: block;">Formato recomendado: JPG, PNG. Resolución mínima: 800x600px</small>
            </label>
            <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: center;">
                <button type="submit"><i class="fas fa-save"></i> Registrar Planta</button>
                <button type="button" onclick="document.getElementById('modal-agregar-planta').style.display='none'"><i class="fas fa-times"></i> Cancelar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para modificar planta -->
<div id="modal-editar-planta" class="modal" style="display:none;">
    <div class="modal-content" id="modal-content-editar-planta"></div>
</div>
