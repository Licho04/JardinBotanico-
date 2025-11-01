<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listar Usuarios</title>
    
</head>

<body>

    <h1 style="text-align: center;">Lista de Usuarios</h1>

    <?php
    include('../configuracion/conexion.php');

    // Si se va a editar un usuario
    if (isset($_GET['usuario'])) {
        $usuario = $_GET['usuario'];
        $sql = "SELECT * FROM usuarios WHERE usuario = '$usuario'";
        $res = mysqli_query($conexion, $sql);
        $datos = mysqli_fetch_assoc($res);
        ?>
        <h2>Modificar usuario: <?php echo htmlspecialchars($usuario); ?></h2>
        <form action="modificar.php" method="post" style="margin-bottom:24px;">
            <input type="hidden" name="usuario" value="<?php echo htmlspecialchars($datos['usuario']); ?>">
            <label>Nombre: <input type="text" name="nombre" value="<?php echo htmlspecialchars($datos['nombre']); ?>" required></label><br>
            <label>Correo: <input type="email" name="mail" value="<?php echo htmlspecialchars($datos['mail']); ?>" required></label><br>
            <label>Contraseña: <input type="text" name="password" value="<?php echo htmlspecialchars($datos['password']); ?>" required></label><br>
            <label>Tipo:
                <select name="tipo">
                    <option value="0" <?php if($datos['tipo']==0) echo 'selected'; ?>>Usuario</option>
                    <option value="1" <?php if($datos['tipo']==1) echo 'selected'; ?>>Administrador</option>
                </select>
            </label><br>
            <button type="submit">Guardar cambios</button>
        </form>
        <hr>
        <?php
    }
    ?>

    <h2>Lista de usuarios</h2>
    <a href="registro.html" class="boton-nuevo-usuario" style="width:auto;display:inline-block;margin-bottom:16px;">Agregar nuevo usuario</a>
    <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Tipo</th>
            <th>Acciones</th>
        </tr>
        <?php
        $sql = "SELECT usuario, nombre, mail, tipo FROM usuarios";
        $result = mysqli_query($conexion, $sql);
        while($row = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($row['usuario']); ?></td>
            <td><?php echo htmlspecialchars($row['nombre']); ?></td>
            <td><?php echo htmlspecialchars($row['mail']); ?></td>
            <td><?php echo $row['tipo'] == 1 ? 'Administrador' : 'Usuario'; ?></td>
            <td>
                <a href="listUsers.php?usuario=<?php echo urlencode($row['usuario']); ?>">Modificar</a>

            </td>
        </tr>
        <?php endwhile; ?>
    </table>

</body>
</html>