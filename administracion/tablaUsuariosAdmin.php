<?php
include('../configuracion/conexion.php');
$sql = "SELECT usuario, nombre, mail, tipo FROM usuarios";
$result = mysqli_query($conexion, $sql);
?>
<h2>Lista de usuarios</h2>
<button id="btn-agregar-usuario" class="boton-nuevo-usuario" style="width:auto;display:inline-block;margin-bottom:16px;">Agregar nuevo usuario</button>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
    <tr>
        <th>Usuario</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Tipo</th>
        <th>Acciones</th>
    </tr>
    <?php while($row = mysqli_fetch_assoc($result)): ?>
    <tr>
        <td><?php echo htmlspecialchars($row['usuario']); ?></td>
        <td><?php echo htmlspecialchars($row['nombre']); ?></td>
        <td><?php echo htmlspecialchars($row['mail']); ?></td>
        <td><?php echo $row['tipo'] == 1 ? 'Administrador' : 'Usuario'; ?></td>
        <td>
            <button class="btn-modificar"
                data-usuario="<?php echo htmlspecialchars($row['usuario']); ?>"
            >Modificar</button>
            <button class="btn-eliminar"
                data-usuario="<?php echo htmlspecialchars($row['usuario']); ?>"
            >Eliminar</button>
        </td>
    </tr>
    <?php endwhile; ?>
</table>

<!-- Modal para agregar usuario -->
<div id="modal-agregar" class="modal" style="display:none;">
    <div class="modal-content" id="modal-content-agregar">
        <h2>Agregar nuevo usuario</h2>
            <form action="../autenticacion/insregistro.php" method="post">
            <label>
                Usuario:
                <input type="text" name="usuario" required placeholder="Nombre de usuario">
            </label>
            <label>
                Nombre:
                <input type="text" name="nombre" required placeholder="Nombre completo">
            </label>
            <label>
                Correo:
                <input type="email" name="mail" required placeholder="correo@ejemplo.com">
            </label>
            <label>
                Contraseña:
                <input type="password" name="password" required placeholder="Contraseña segura">
            </label>
            <label>
                Tipo:
                <select name="tipo">
                    <option value="0">Usuario</option>
                    <option value="1">Administrador</option>
                </select>
            </label>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button type="submit">Agregar usuario</button>
                <button type="button" onclick="document.getElementById('modal-agregar').style.display='none'">Cancelar</button>
            </div>
        </form>
    </div>
</div> 