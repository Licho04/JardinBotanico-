# 🚀 Guía de Despliegue en Render.com

## Pasos para desplegar tu API

### 1. Subir código a GitHub
```bash
git add .
git commit -m "Preparar para despliegue en Render"
git push origin sqlite-native
```

### 2. Crear cuenta en Render
- Ve a: https://render.com/
- Haz clic en "Get Started for Free"
- Puedes registrarte con tu cuenta de GitHub

### 3. Crear Web Service
1. En el dashboard de Render, clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona: `Licho04/JardinBotanico-`
5. Selecciona la rama: `sqlite-native`

### 4. Configuración del servicio
- **Name**: `jardin-botanico-api`
- **Region**: Oregon (US West)
- **Branch**: `sqlite-native`
- **Root Directory**: `api`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. Variables de entorno
Agregar estas variables en la sección "Environment":
```
PORT=3000
JWT_SECRET=tu_clave_super_secreta_cambiar_esto_123456
NODE_VERSION=18
```

### 6. Plan
- Selecciona: **Free**
- Clic en "Create Web Service"

### 7. Esperar despliegue
- Render instalará dependencias
- Iniciará tu servidor
- Te dará una URL pública: `https://jardin-botanico-api.onrender.com`

### 8. Probar API
```bash
# Listar plantas
curl https://jardin-botanico-api.onrender.com/api/plantas

# Login
curl -X POST https://jardin-botanico-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"Licho","password":"1412"}'
```

## ⚠️ Nota sobre SQLite en Render

**IMPORTANTE**: Render usa almacenamiento efímero. Esto significa que:
- Los datos en `database.sqlite` se perderán cada vez que se reinicie el servicio
- El servicio se reinicia automáticamente cada vez que haces push a GitHub
- El plan gratuito "duerme" después de 15 minutos de inactividad

### Solución para datos persistentes:

**Opción 1: Usar PostgreSQL** (recomendado para producción)
- Render ofrece PostgreSQL gratis
- Los datos persisten permanentemente

**Opción 2: Inicializar con datos de prueba** (para desarrollo)
- El script `init-database.js` crea las tablas automáticamente
- Puedes agregar datos de prueba en el script

**Opción 3: Railway.app** ($5/mes)
- Almacenamiento persistente
- SQLite funciona perfectamente
- No se duerme

## 🔗 URL de tu API

Una vez desplegado, tu API estará en:
```
https://jardin-botanico-api.onrender.com
```

Comparte esta URL con tu compañero para la app móvil.

## 📱 Endpoints disponibles

```
GET  /api/plantas              # Listar todas las plantas
GET  /api/plantas/:id          # Ver una planta
POST /api/auth/registro        # Registrar usuario
POST /api/auth/login           # Iniciar sesión
POST /api/solicitudes          # Crear solicitud (requiere token)
GET  /api/solicitudes          # Ver solicitudes (requiere token)
```

## 🐛 Solución de problemas

**Si el deploy falla:**
1. Ve a "Logs" en Render
2. Busca errores en la instalación
3. Verifica que `package.json` esté correcto

**Si la API no responde:**
1. Verifica que el servicio esté "Running"
2. Los primeros 30 segundos después de "despertar" puede ser lento
3. Revisa los logs en tiempo real

## 📊 Monitoreo

- **Dashboard**: https://dashboard.render.com
- **Logs en vivo**: Clic en tu servicio → "Logs"
- **Reiniciar**: Manual Restart en el dashboard
