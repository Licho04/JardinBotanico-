<?php
//script para actualizar los datos de registros de usuario por parte del admin

include('../configuracion/conexion.php');

$idus =$_POST['usuario'];

$cadenasql="SELECT * FROM usuarios WHERE usuario='".$idus."'";

$resultado = mysqli_query($conexion,$cadenasql);

if(mysqli_num_rows($resultado)==0)
{
	echo "No se encuentra el usuario";
}
else
{
	$fila=mysqli_fetch_array($resultado);
	?>
	<h2>Modificar usuario</h2>
	<form action="cambios.php" method="post">
		<input type="hidden" name="usuario_original" value="<?php echo $fila['usuario']; ?>">
		<label>Usuario:</label>
		<input type="text" name="usuario" readonly value="<?php echo $fila['usuario']; ?>" style="background-color: #f0f0f0;"><br>
		<small style="color: #666;">El nombre de usuario no se puede modificar</small><br>
		<label>Nombre:</label>
		<input type="text" name="nombre" value="<?php echo $fila['nombre']; ?>"><br>
		<label>Correo:</label>
		<input type="email" name="mail" value="<?php echo $fila['mail']; ?>"><br>
		<label>Contraseña:</label>
		<input type="text" name="password" value="<?php echo $fila['password']; ?>"><br>
		<label>Tipo:</label>
		<select name="tipo">
			<option value="0" <?php if($fila['tipo']==0) echo 'selected'; ?>>Usuario</option>
			<option value="1" <?php if($fila['tipo']==1) echo 'selected'; ?>>Administrador</option>
		</select><br>
		<button type="submit">Actualizar</button>
		<button type="button" onclick="document.getElementById('modal-editar').style.display='none'">Cancelar</button>
	</form>
	<?php	
}
?>