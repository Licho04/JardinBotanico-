# 📋 Resumen: Compartir Base de Datos en Tiempo Real

## 🎯 Objetivo

Que **tú y tu compañero** vean los mismos datos en tiempo real:
- ✅ Tu compañero agrega una planta → Tú la ves
- ✅ Tú agregas una planta → Tu compañero la ve

---

## ✅ Solución Simple

**Un solo cambio en tu código:**

### Archivo: `configuracion/conexion.php`

**Línea 17:** Cambiar la URL:

```php
// De esto (local):
$apiUrl = 'http://localhost:3001/api';

// A esto (servidor compartido):
$apiUrl = 'http://servidor-universidad.edu.mx:3001/api';
```

¡Listo! Ahora ambos consumen la misma API y base de datos.

---

## 📝 Pasos Completos

1. **Desplegar API en servidor** → Ver `DEPLOY_API_SERVIDOR.md`
2. **Cambiar URL en PHP** → `configuracion/conexion.php` línea 17
3. **Compartir URL con compañero** → `INFORMACION_COMPARTIR_COMPAÑERO.md`

---

## 📚 Documentación Completa

- **`COMPARTIR_BASE_DATOS_TIEMPO_REAL.md`** - Guía completa paso a paso
- **`DEPLOY_API_SERVIDOR.md`** - Cómo desplegar la API
- **`INFORMACION_COMPARTIR_COMPAÑERO.md`** - Qué compartir con tu compañero

---

## 🔄 Flujo

```
Tu PHP (localhost) ──┐
                     │
                     ├─▶ API (servidor) ──▶ database.sqlite (servidor)
                     │
App Móvil (compañero)┘
```

**Todos → Misma API → Misma Base de Datos → Mismos Datos**

---

## ⚙️ Configuración Automática (Opcional)

Si quieres que funcione automáticamente en local y producción:

1. Editar `configuracion/conexion.php`:
   - Comentar línea 17
   - Descomentar líneas 21-22

2. Editar `configuracion/config_api.php`:
   - Cambiar la URL del servidor (línea 30)

Ventaja: Funciona en local sin cambiar código.

---

## ✅ Checklist

- [ ] API desplegada en servidor compartido
- [ ] `configuracion/conexion.php` apunta al servidor (no localhost)
- [ ] Tu compañero tiene la URL de la API del servidor
- [ ] Probado: Ambos ven los mismos datos

---

## 💡 Nota Importante

La base de datos `database.sqlite` debe estar en el **servidor compartido**, no localmente.

Cuando desplegas la API, la base de datos se crea en el servidor, y todos la comparten automáticamente.

