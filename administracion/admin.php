<?php
session_start();

// Verifica si el usuario está logueado y es administrador
if (!isset($_SESSION['mail']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] != 1) {
    // Si no es admin, redirige al inicio
    header("Location: ../index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel de Administrador</title>
    <link rel="stylesheet" href="../recursos/estilos/styles.css?v=<?php echo time(); ?>">
</head>
<body>
    <header class="encabezado">
        <div class="encabezado-izquierda">
            <img src="../recursos/imagenes/logo_transparente.png" alt="Logo Plantas Medicinales" class="logo">
            <div>
                <h1 class="titulo">Plantas Medicinales</h1>
            </div>
        </div>
        <nav class="navegacion">
            <a href="../index.php">Inicio</a>
            <a href="../usuario/historia.php">Historia</a>
            <div class="menu-hamburguesa">
                <button id="btn-menu-admin">&#9776;</button>
                <div id="menu-opciones-admin" style="display: none;">
                    <a href="../usuario/perfil.php">Perfil</a>
                    <a href="../autenticacion/cerrar_sesion.php">Cerrar sesión</a>
                </div>
            </div>
        </nav>
    </header>
    <main class="admin-dashboard">
        <aside class="admin-sidebar">
            <button class="sidebar-btn active" id="btn-usuarios" type="button">Administrar usuarios</button>
            <button class="sidebar-btn" id="btn-plantas" type="button">Administrar plantas</button>
            <button class="sidebar-btn" id="btn-solicitudes" type="button">Solicitudes de donación</button>
        </aside>
        <section class="admin-panel">
            <?php
            // Por defecto muestra usuarios, o según el parámetro GET
            $vista = isset($_GET['vista']) ? $_GET['vista'] : 'usuarios';
            if ($vista === 'plantas') {
                // Aquí puedes incluir el contenido de plantas
                include 'tablaPlantasAdmin.php';
                echo "<script>
                var btnAgregarPlanta = document.getElementById('btn-agregar-planta');
                if(btnAgregarPlanta){
                    btnAgregarPlanta.onclick = function() {
                        document.getElementById('modal-agregar-planta').style.display = 'flex';
                    };
                }
                var modalAgregarPlanta = document.getElementById('modal-agregar-planta');
                if(modalAgregarPlanta){
                    modalAgregarPlanta.onclick = function(e){
                        if(e.target === this) this.style.display = 'none';
                    };
                }
                </script>";
            } elseif ($vista === 'solicitudes') {
                // Mostrar tabla de solicitudes
                include 'tablaSolicitudesAdmin.php';
                echo "<script>
                // Scripts para manejo de solicitudes
                document.querySelectorAll('.btn-responder-solicitud').forEach(function(btn){
                    btn.onclick = function() {
                        var id = this.dataset.id;
                        var modal = document.getElementById('modal-responder-solicitud');
                        var content = document.getElementById('modal-content-responder');
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', '../solicitudes/responder_solicitud.php', true);
                        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        xhr.onload = function() {
                            content.innerHTML = xhr.responseText;
                            modal.style.display = 'flex';
                        };
                        xhr.send('id=' + encodeURIComponent(id));
                    };
                });
                </script>";
            } else {
                // Mostrar tabla de usuarios directamente
                include 'tablaUsuariosAdmin.php';
                echo "<script>
                var btnAgregar = document.getElementById('btn-agregar-usuario');
                if(btnAgregar){
                    btnAgregar.onclick = function() {
                        document.getElementById('modal-agregar').style.display = 'flex';
                    };
                }
                var modalAgregar = document.getElementById('modal-agregar');
                if(modalAgregar){
                    modalAgregar.onclick = function(e){
                        if(e.target === this) this.style.display = 'none';
                    };
                }
                </script>";
            }
            ?>
            <!-- Modal para editar usuario -->
            <div id="modal-editar" class="modal" style="display:none;">
                <div class="modal-content" id="modal-content">
                    <!-- Aqui se carga el formulario por JS -->
                </div>
            </div>
            <!-- Modal para modificar planta -->
            <div id="modal-editar-planta" class="modal" style="display:none;">
                <div class="modal-content" id="modal-content-editar-planta">
                    <!-- Aqui se carga el formulario por JS -->
                </div>
            </div>
            <!-- Modal para responder solicitud -->
            <div id="modal-responder-solicitud" class="modal" style="display:none;">
                <div class="modal-content" id="modal-content-responder">
                    <!-- Aqui se carga el formulario por JS -->
                </div>
            </div>
        </section>
    </main>
    <script>
    // Configurar los botones de navegación
    function configurarBotones() {
        var btnUsuarios = document.getElementById('btn-usuarios');
        var btnPlantas = document.getElementById('btn-plantas');
        var btnSolicitudes = document.getElementById('btn-solicitudes');
        
        if(btnUsuarios) {
            btnUsuarios.onclick = function() {
                window.location = 'admin.php?vista=usuarios';
            };
        }
        
        if(btnPlantas) {
            btnPlantas.onclick = function() {
                window.location = 'admin.php?vista=plantas';
            };
        }
        
        if(btnSolicitudes) {
            btnSolicitudes.onclick = function() {
                window.location = 'admin.php?vista=solicitudes';
            };
        }
        
        // Debug: verificar que los botones están configurados
        console.log('Botones configurados:', {
            usuarios: btnUsuarios,
            plantas: btnPlantas,
            solicitudes: btnSolicitudes
        });
        
        // Marcar activo el boton correcto
        if(window.location.search.indexOf('vista=plantas') !== -1){
            if(btnPlantas) btnPlantas.classList.add('active');
            if(btnUsuarios) btnUsuarios.classList.remove('active');
            if(btnSolicitudes) btnSolicitudes.classList.remove('active');
        } else if(window.location.search.indexOf('vista=solicitudes') !== -1){
            if(btnSolicitudes) btnSolicitudes.classList.add('active');
            if(btnUsuarios) btnUsuarios.classList.remove('active');
            if(btnPlantas) btnPlantas.classList.remove('active');
        } else {
            if(btnUsuarios) btnUsuarios.classList.add('active');
            if(btnPlantas) btnPlantas.classList.remove('active');
            if(btnSolicitudes) btnSolicitudes.classList.remove('active');
        }
    }
    
    // Configurar modales
    function configurarModales() {
        // Modal editar usuario usando AJAX
        document.querySelectorAll('.btn-modificar').forEach(function(btn){
            btn.onclick = function() {
                var usuario = this.dataset.usuario;
                var modal = document.getElementById('modal-editar');
                var content = document.getElementById('modal-content');
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'modificar.php', true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onload = function() {
                    content.innerHTML = xhr.responseText;
                    modal.style.display = 'flex';
                };
                xhr.send('usuario=' + encodeURIComponent(usuario));
            };
        });
        
        // Modal eliminar usuario usando AJAX
        document.querySelectorAll('.btn-eliminar').forEach(function(btn){
            btn.onclick = function() {
                if(confirm('¿Seguro que deseas eliminar este usuario?')) {
                    var usuario = this.dataset.usuario;
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'eliminar.php', true);
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhr.onload = function() {
                        alert('Usuario eliminado');
                        location.reload();
                    };
                    xhr.send('usuario=' + encodeURIComponent(usuario));
                }
            };
        });
        
        // Modal modificar planta usando AJAX
        document.querySelectorAll('.btn-modificar-planta').forEach(function(btn){
            btn.onclick = function() {
                var nombre = this.dataset.nombre;
                var modal = document.getElementById('modal-editar-planta');
                var content = document.getElementById('modal-content-editar-planta');
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '../plantas/modificar_planta.php', true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onload = function() {
                    content.innerHTML = xhr.responseText;
                    modal.style.display = 'flex';
                };
                xhr.send('nombre=' + encodeURIComponent(nombre));
            };
        });
        
        // Cerrar modal de plantas al hacer clic fuera
        var modalEditarPlanta = document.getElementById('modal-editar-planta');
        if(modalEditarPlanta) {
            modalEditarPlanta.onclick = function(e){
                if(e.target === this) this.style.display = 'none';
            };
        }
        
        // Modal eliminar planta usando AJAX
        document.querySelectorAll('.btn-eliminar-planta').forEach(function(btn){
            btn.onclick = function() {
                if(confirm('¿Seguro que deseas eliminar esta planta?')) {
                    var nombre = this.dataset.nombre;
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', '../plantas/eliminar_planta.php', true);
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhr.onload = function() {
                        alert('Planta eliminada');
                        location.reload();
                    };
                    xhr.send('nombre=' + encodeURIComponent(nombre));
                }
            };
        });
    }
    
    // Configurar menú hamburguesa del admin
    var btnMenuAdmin = document.getElementById('btn-menu-admin');
    if(btnMenuAdmin){
        btnMenuAdmin.onclick = function() {
            var menu = document.getElementById('menu-opciones-admin');
            if(menu.style.display === 'flex'){
                menu.style.display = 'none';
            } else {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'column';
            }
        };
    }
    
    // Ejecutar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        configurarBotones();
        configurarModales();
    });
    
    // También ejecutar inmediatamente por si el DOM ya está listo
    if(document.readyState === 'loading') {
        // DOM aún no está listo
    } else {
        // DOM ya está listo
        configurarBotones();
        configurarModales();
    }
    </script>
</body>
</html>
