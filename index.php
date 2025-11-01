<?php
session_start();
include('configuracion/conexion.php');
$plantas = [];
$sql = "SELECT nombre, imagen FROM plantas";
$result = mysqli_query($conexion, $sql);
while($row = mysqli_fetch_assoc($result)){
    $plantas[] = $row;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantas Medicinales</title>
    <link rel="stylesheet" href="recursos/estilos/styles.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="encabezado">
        <div class="encabezado-izquierda">
            <img src="recursos/imagenes/logo_transparente.png" alt="Logo Plantas Medicinales" class="logo">
            <div>
                <h1 class="titulo">Plantas Medicinales</h1>
            </div>
        </div>
        <nav class="navegacion">
            <a href="index.php">Inicio</a>
            <a href="usuario/historia.php">Historia</a>
            <?php if(!isset($_SESSION['mail'])): ?>
                <a href="autenticacion/inicio_sesion.html" class="btn-sesion">Iniciar Sesión</a>
            <?php endif; ?>
            <?php if(isset($_SESSION['mail'])): ?>
                <div class="menu-hamburguesa">
                    <button id="btn-menu">&#9776;</button>
                    <div id="menu-opciones" style="display: none;">
                        <a href="usuario/perfil.php">Perfil</a>
                        <?php if($_SESSION['tipo'] == 0): ?>
                            <a href="#" id="btn-solicitud-donacion">Solicitar Donación</a>
                        <?php endif; ?>
                        <?php if($_SESSION['tipo'] == 1): ?>
                            <a href="administracion/admin.php">Administrador</a>
                        <?php endif; ?>
                        <a href="autenticacion/cerrar_sesion.php">Cerrar sesión</a>
                    </div>
                </div>
            <?php endif; ?>
        </nav>
    </header>

    <main class="contenido-principal">
        <section class="barra-lateral">
            <div class="cientifico-destacado">
                <h3>Catálogo Científico</h3>
                <p>Explora nuestra colección de plantas medicinales con información científica detallada.</p>
            </div>
            
            <form class="busqueda" onsubmit="return false;">
                <input type="text" placeholder="Buscar planta medicinal..." id="busqueda-input">
            </form>
            
            <div class="lista-elementos" id="lista-plantas">
                <?php foreach($plantas as $planta): ?>
                <div class="elemento planta-item" data-nombre="<?php echo htmlspecialchars($planta['nombre']); ?>">
                    <div class="imagen-placeholder">
                        <?php if($planta['imagen']): ?>
                            <img src="recursos/imagenes/<?php echo htmlspecialchars($planta['imagen']); ?>" alt="<?php echo htmlspecialchars($planta['nombre']); ?>" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
                        <?php else: ?>
                            🌱
                        <?php endif; ?>
                    </div>
                    <span class="nombre"><?php echo htmlspecialchars($planta['nombre']); ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </section>
        
        <section class="descripcion" id="info-planta">
            <div class="descripcion-texto" id="info-planta-content">
                <div class="alert-info">
                    <h3><i class="fas fa-microscope"></i> Información Científica</h3>
                    <p>Selecciona una planta del catálogo para consultar su información científica detallada, incluyendo:</p>
                    <ul style="margin: 12px 0; padding-left: 20px;">
                        <li>Nomenclatura científica</li>
                        <li>Propiedades medicinales</li>
                        <li>Distribución geográfica</li>
                        <li>Usos tradicionales y modernos</li>
                    </ul>
                </div>
            </div>
        </section>
    </main>
    <footer class="pie-pagina">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px; max-width: 1200px; margin-left: auto; margin-right: auto;">
            <div>
                <h4 style="color: var(--blanco); font-size: 1.2rem; margin-bottom: 16px; border-bottom: 2px solid var(--verde-vibrante); padding-bottom: 8px;">
                    <i class="fas fa-leaf"></i> Plantas Medicinales
                </h4>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin-bottom: 16px;">
                    Catálogo científico especializado en plantas medicinales y sus propiedades terapéuticas.
                </p>
                <div style="display: flex; align-items: center; gap: 12px; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Zona de la Cultura, Villahermosa, Tabasco</span>
                </div>
            </div>
            
            <div>
                <h4 style="color: var(--blanco); font-size: 1.2rem; margin-bottom: 16px; border-bottom: 2px solid var(--verde-vibrante); padding-bottom: 8px;">
                    <i class="fas fa-microscope"></i> Investigación Científica
                </h4>
                <ul style="list-style: none; padding: 0; color: rgba(255, 255, 255, 0.9);">
                    <li style="margin-bottom: 8px;"><i class="fas fa-seedling" style="color: var(--verde-vibrante); margin-right: 8px;"></i>Botánica Medicinal</li>
                    <li style="margin-bottom: 8px;"><i class="fas fa-pills" style="color: var(--verde-vibrante); margin-right: 8px;"></i>Farmacognosia</li>
                    <li style="margin-bottom: 8px;"><i class="fas fa-dna" style="color: var(--verde-vibrante); margin-right: 8px;"></i>Fitoterapia</li>
                    <li style="margin-bottom: 8px;"><i class="fas fa-leaf" style="color: var(--verde-vibrante); margin-right: 8px;"></i>Etnobotánica</li>
                </ul>
            </div>
            
            <div>
                <h4 style="color: var(--blanco); font-size: 1.2rem; margin-bottom: 16px; border-bottom: 2px solid var(--verde-vibrante); padding-bottom: 8px;">
                    <i class="fas fa-link"></i> Enlaces Institucionales
                </h4>
                <ul style="list-style: none; padding: 0; color: rgba(255, 255, 255, 0.9);">
                    <li style="margin-bottom: 8px;"><a href="https://www.ujat.mx/" style="color: rgba(255, 255, 255, 0.9); text-decoration: none; transition: color 0.3s ease;">Sitio Web UJAT</a></li>
                    <li style="margin-bottom: 8px;"><a href="https://www.ujat.mx/" style="color: rgba(255, 255, 255, 0.9); text-decoration: none; transition: color 0.3s ease;">Portal Académico</a></li>
                    <li style="margin-bottom: 8px;"><a href="https://www.ujat.mx/" style="color: rgba(255, 255, 255, 0.9); text-decoration: none; transition: color 0.3s ease;">Biblioteca Virtual</a></li>
                    <li style="margin-bottom: 8px;"><a href="https://www.ujat.mx/" style="color: rgba(255, 255, 255, 0.9); text-decoration: none; transition: color 0.3s ease;">Investigación UJAT</a></li>
                </ul>
            </div>
        </div>
        
        <div class="redes-sociales">
            <a href="https://www.facebook.com/ujat.mx" class="icono-red-social" title="Facebook UJAT">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/UJAT" class="icono-red-social" title="Twitter UJAT">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="http://www.youtube.com/user/UJATmx" class="icono-red-social" title="YouTube UJAT">
                <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/ujat/" class="icono-red-social" title="Instagram UJAT">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.ujat.mx/Contenido/Interior/348" class="icono-red-social" title="Contacto UJAT">
                <i class="fas fa-envelope"></i>
            </a>
            <a href="https://www.ujat.tv/" class="icono-red-social" title="TV UJAT">
                <i class="fas fa-tv"></i>
            </a>
        </div>
        
        <div class="informacion-contacto">
            <p><strong>Plantas Medicinales - UJAT</strong></p>
            <p>Av. Universidad s/n, Zona de la Cultura, Col. Magisterial, Villahermosa, Centro, Tabasco, México. C.P. 86040</p>
            <p>Teléfono: (993) 358 15 00 | Email: info@ujat.mx</p>
            <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.7);">
                © 2025 Plantas Medicinales UJAT. Todos los derechos reservados.
            </p>
        </div>
    </footer>
    
    <!-- Modal para solicitud de donación -->
    <div id="modal-solicitud-donacion" class="modal" style="display:none;">
        <div class="modal-content">
            <h2><i class="fas fa-seedling"></i> Solicitud de Donación Científica</h2>
            <div class="alert-info">
                <p><strong>Contribución Científica:</strong> Tu donación ayudará a enriquecer nuestro catálogo científico y promover la investigación en plantas medicinales.</p>
            </div>
            <form action="solicitudes/enviar_solicitud.php" method="post">
                <label>
                    <i class="fas fa-leaf"></i> Nombre común de la planta:
                    <input type="text" name="nombre_planta" required placeholder="Ej: Manzanilla, Romero, Albahaca...">
                </label>
                <label>
                    <i class="fas fa-file-alt"></i> Descripción morfológica:
                    <textarea name="descripcion_planta" required placeholder="Describe las características físicas de la planta (tamaño, forma de hojas, flores, etc.)..."></textarea>
                </label>
                <label>
                    <i class="fas fa-pills"></i> Propiedades medicinales conocidas:
                    <textarea name="propiedades_medicinales" required placeholder="Describe las propiedades medicinales y usos terapéuticos documentados..."></textarea>
                </label>
                <label>
                    <i class="fas fa-map-marker-alt"></i> Ubicación geográfica:
                    <input type="text" name="ubicacion" required placeholder="Ej: Jardín particular, Parque local, Área natural protegida...">
                </label>
                <label>
                    <i class="fas fa-heart"></i> Motivo de la donación:
                    <textarea name="motivo_donacion" required placeholder="Explica el propósito científico o educativo de tu donación..."></textarea>
                </label>
                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: center;">
                    <button type="submit"><i class="fas fa-paper-plane"></i> Enviar Solicitud</button>
                    <button type="button" onclick="document.getElementById('modal-solicitud-donacion').style.display='none'"><i class="fas fa-times"></i> Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
    var btnMenu = document.getElementById('btn-menu');
    if(btnMenu){
        btnMenu.onclick = function() {
            var menu = document.getElementById('menu-opciones');
            if(menu.style.display === 'flex'){
                menu.style.display = 'none';
            } else {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'column';
            }
        };
    }
    // Función para filtrar plantas
    function filtrarPlantas() {
        var busqueda = document.getElementById('busqueda-input').value.toLowerCase();
        var plantas = document.querySelectorAll('.planta-item');
        
        plantas.forEach(function(planta) {
            var nombre = planta.querySelector('.nombre').textContent.toLowerCase();
            if (nombre.includes(busqueda)) {
                planta.style.display = 'flex';
            } else {
                planta.style.display = 'none';
            }
        });
    }
    
    // Búsqueda en tiempo real
    document.getElementById('busqueda-input').addEventListener('input', filtrarPlantas);
    
    // Modal de solicitud de donación
    var btnSolicitud = document.getElementById('btn-solicitud-donacion');
    if(btnSolicitud){
        btnSolicitud.onclick = function(e) {
            e.preventDefault();
            document.getElementById('modal-solicitud-donacion').style.display = 'flex';
        };
    }
    
    // Cerrar modal al hacer clic fuera
    var modalSolicitud = document.getElementById('modal-solicitud-donacion');
    if(modalSolicitud){
        modalSolicitud.onclick = function(e){
            if(e.target === this) this.style.display = 'none';
        };
    }
    
    document.querySelectorAll('.planta-item').forEach(function(item){
        item.onclick = function() {
            // Remover selección previa
            document.querySelectorAll('.planta-item').forEach(function(el) {
                el.classList.remove('selected');
            });
            
            // Agregar selección al elemento actual
            this.classList.add('selected');
            
            var nombre = this.dataset.nombre;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'plantas/info_planta.php', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                document.getElementById('info-planta-content').innerHTML = xhr.responseText;
            };
            xhr.send('nombre=' + encodeURIComponent(nombre));
        };
    });
    </script>
</body>
</html>