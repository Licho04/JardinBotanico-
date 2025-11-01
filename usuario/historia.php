<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historia - Jardín Botánico</title>
    <link rel="stylesheet" href="../recursos/estilos/styles.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .construccion-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            max-width: 900px;
            width: 100%;
        }
        
        .construccion-icono {
            font-size: 6rem;
            color: #4b6e3c;
            margin-bottom: 30px;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-20px);
            }
            60% {
                transform: translateY(-10px);
            }
        }
        
        .construccion-titulo {
            font-size: 2.5rem;
            color: #2d4c2a;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .construccion-descripcion {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 30px;
            max-width: 600px;
            line-height: 1.6;
        }
        
        .construccion-caracteristicas {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            max-width: 800px;
        }
        
        .caracteristica {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #4b6e3c;
            min-width: 200px;
            text-align: left;
        }
        
        .caracteristica h3 {
            color: #2d4c2a;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .caracteristica p {
            color: #666;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .btn-volver {
            background: #4b6e3c;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            transition: background 0.3s;
        }
        
        .btn-volver:hover {
            background: #2d4c2a;
        }
        
        .progreso-container {
            width: 100%;
            max-width: 400px;
            margin: 30px auto;
        }
        
        .progreso-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progreso-fill {
            height: 100%;
            background: linear-gradient(90deg, #4b6e3c, #7ca77a);
            width: 25%;
            animation: progress 3s ease-in-out infinite;
        }
        
        @keyframes progress {
            0% { width: 25%; }
            50% { width: 75%; }
            100% { width: 25%; }
        }
        
        .progreso-texto {
            text-align: center;
            margin-top: 10px;
            color: #666;
            font-size: 0.9rem;
        }
        
        /* Responsive para pantallas pequeñas */
        @media (max-width: 768px) {
            .construccion-container {
                padding: 20px 15px;
            }
            
            .construccion-titulo {
                font-size: 2rem;
            }
            
            .construccion-descripcion {
                font-size: 1rem;
            }
            
            .construccion-caracteristicas {
                gap: 15px;
            }
            
            .caracteristica {
                min-width: 150px;
                padding: 15px;
            }
        }
    </style>
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
            <a href="historia.php">Historia</a>
            <?php if(!isset($_SESSION['mail'])): ?>
                <a href="../autenticacion/inicio_sesion.html" class="btn-sesion">Iniciar Sesión</a>
            <?php endif; ?>
            <?php if(isset($_SESSION['mail'])): ?>
                <div class="menu-hamburguesa">
                    <button id="btn-menu">&#9776;</button>
                    <div id="menu-opciones" style="display: none;">
                        <a href="perfil.php">Perfil</a>
                        <?php if($_SESSION['tipo'] == 0): ?>
                            <a href="#" id="btn-solicitud-donacion">Solicitar Donación</a>
                        <?php endif; ?>
                        <?php if($_SESSION['tipo'] == 1): ?>
                            <a href="../administracion/admin.php">Administrador</a>
                        <?php endif; ?>
                        <a href="../autenticacion/cerrar_sesion.php">Cerrar sesión</a>
                    </div>
                </div>
            <?php endif; ?>
        </nav>
    </header>

    <main class="contenido-principal" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
        <div class="construccion-container">
            <div class="construccion-icono">
                <i class="fas fa-book-open"></i>
            </div>
            
            <h1 class="construccion-titulo">Historia en Construcción</h1>
            
            <p class="construccion-descripcion">
                Estamos preparando una sección completa sobre la rica historia del Jardín Botánico. 
                Pronto podrás conocer los orígenes, evolución y momentos importantes que han 
                marcado el desarrollo de nuestro jardín.
            </p>
            
            <div class="progreso-container">
                <div class="progreso-bar">
                    <div class="progreso-fill"></div>
                </div>
                <div class="progreso-texto">Investigación histórica en progreso...</div>
            </div>
            
            <div class="construccion-caracteristicas">
                <div class="caracteristica">
                    <h3><i class="fas fa-calendar-alt"></i> Orígenes</h3>
                    <p>Descubre cómo comenzó el Jardín Botánico y sus primeros años</p>
                </div>
                
                <div class="caracteristica">
                    <h3><i class="fas fa-seedling"></i> Evolución</h3>
                    <p>Conoce el crecimiento y desarrollo a lo largo de los años</p>
                </div>
                
                <div class="caracteristica">
                    <h3><i class="fas fa-users"></i> Personajes</h3>
                    <p>Historia de las personas que han contribuido al jardín</p>
                </div>
                
                <div class="caracteristica">
                    <h3><i class="fas fa-trophy"></i> Logros</h3>
                    <p>Reconocimientos y momentos destacados del jardín</p>
                </div>
            </div>
            
            <a href="../index.php" class="btn-volver">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </a>
        </div>
    </main>

    <footer class="pie-pagina">
        <div class="redes-sociales">
            <a href="https://www.facebook.com/ujat.mx" class="icono-red-social">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/UJAT" class="icono-red-social">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="http://www.youtube.com/user/UJATmx" class="icono-red-social">
                <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/ujat/" class="icono-red-social">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.ujat.mx/Contenido/Interior/348" class="icono-red-social">
                <i class="fas fa-envelope"></i>
            </a>
            <a href="https://www.ujat.tv/" class="icono-red-social">
                <i class="fas fa-desktop"></i>
            </a>
            <a href="https://www.ujat.mx/Search" class="icono-red-social">
                <i class="fas fa-search"></i>
            </a>
        </div>
        <div class="informacion-contacto">
            <p>Av. Universidad s/n, Zona de la Cultura, Col. Magisterial, Vhsa, Centro, Tabasco, Mex. C.P. 86040.</p>
            <p>Tel (993) 358 15 00</p>
        </div>
    </footer>

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
    </script>
</body>
</html> 