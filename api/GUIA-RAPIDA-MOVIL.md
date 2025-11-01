# Guía Rápida - Consumir API desde App Móvil

## URL de la API (temporal con ngrok)
```
https://TU-URL-NGROK.ngrok-free.app
```

**Nota:** Esta URL cambia cada vez que se reinicia ngrok. Te avisaré cuando cambie.

---

## 1. Login y obtener token

```javascript
// Ejemplo con fetch (JavaScript/React Native)
async function login(usuario, password) {
  const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      usuario: usuario,
      password: password
    })
  });

  const data = await response.json();

  if (data.token) {
    // Guardar el token (AsyncStorage en React Native)
    return data.token;
  } else {
    throw new Error(data.error);
  }
}

// Uso:
const token = await login('usuario123', 'password123');
```

---

## 2. Obtener todas las plantas (NO requiere autenticación)

```javascript
async function obtenerPlantas() {
  const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/plantas');
  const data = await response.json();

  return data.plantas; // Array de plantas
}

// Uso:
const plantas = await obtenerPlantas();
console.log(plantas);
// [{ id: 1, nombre: "Sábila", descripcion: "...", imagen: "sabila.jpeg" }, ...]
```

---

## 3. Obtener detalles de una planta

```javascript
async function obtenerPlanta(id) {
  const response = await fetch(`https://TU-URL-NGROK.ngrok-free.app/api/plantas/${id}`);
  const data = await response.json();

  return data; // { id: 1, nombre: "Sábila", ... }
}

// Uso:
const planta = await obtenerPlanta(1);
```

---

## 4. Ver la imagen de una planta

Las imágenes están en:
```
https://TU-URL-NGROK.ngrok-free.app/recursos/imagenes/NOMBRE_IMAGEN
```

```javascript
// En React Native:
<Image
  source={{ uri: `https://TU-URL-NGROK.ngrok-free.app/recursos/imagenes/${planta.imagen}` }}
  style={{ width: 200, height: 200 }}
/>
```

---

## 5. Crear una solicitud (requiere autenticación)

```javascript
async function crearSolicitud(token, solicitud) {
  const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/solicitudes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ¡IMPORTANTE!
    },
    body: JSON.stringify({
      nombre_planta: solicitud.nombre_planta,
      descripcion_planta: solicitud.descripcion_planta,
      propiedades_medicinales: solicitud.propiedades_medicinales,
      ubicacion: solicitud.ubicacion,
      motivo_donacion: solicitud.motivo_donacion
    })
  });

  const data = await response.json();
  return data;
}

// Uso:
const token = await login('usuario123', 'password123');
const nuevaSolicitud = await crearSolicitud(token, {
  nombre_planta: "Rosa del desierto",
  descripcion_planta: "Planta pequeña con flores rosadas",
  propiedades_medicinales: "Ninguna",
  ubicacion: "Mi jardín",
  motivo_donacion: "Tengo muchas"
});
```

---

## 6. Ver mis solicitudes (requiere autenticación)

```javascript
async function misSolicitudes(token) {
  const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/solicitudes', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data.solicitudes; // Array de solicitudes del usuario
}

// Uso:
const solicitudes = await misSolicitudes(token);
```

---

## 7. Registrar nuevo usuario

```javascript
async function registrarUsuario(usuario, nombre, email, password) {
  const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/auth/registro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      usuario: usuario,
      nombre: nombre,
      mail: email,
      password: password
    })
  });

  const data = await response.json();
  return data;
}

// Uso:
const nuevoUsuario = await registrarUsuario(
  'juan123',
  'Juan Pérez',
  'juan@example.com',
  'password123'
);
```

---

## Manejo de errores

```javascript
async function obtenerPlantasSafe() {
  try {
    const response = await fetch('https://TU-URL-NGROK.ngrok-free.app/api/plantas');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error desconocido');
    }

    return data.plantas;
  } catch (error) {
    console.error('Error al obtener plantas:', error);
    alert('No se pudieron cargar las plantas. Verifica tu conexión.');
    return [];
  }
}
```

---

## Códigos de respuesta HTTP

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error en los datos enviados
- `401` - No autenticado (token inválido)
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error del servidor

---

## Ejemplo completo de flujo en React Native

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://TU-URL-NGROK.ngrok-free.app/api';

// 1. Login y guardar token
async function login(usuario, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password })
  });

  const data = await response.json();

  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  } else {
    throw new Error(data.error);
  }
}

// 2. Obtener token guardado
async function getToken() {
  return await AsyncStorage.getItem('token');
}

// 3. Usar en componente
function PlantasScreen() {
  const [plantas, setPlantas] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/plantas`)
      .then(res => res.json())
      .then(data => setPlantas(data.plantas))
      .catch(error => console.error(error));
  }, []);

  return (
    <FlatList
      data={plantas}
      renderItem={({ item }) => (
        <View>
          <Text>{item.nombre}</Text>
          <Image
            source={{ uri: `${API_URL.replace('/api', '')}/recursos/imagenes/${item.imagen}` }}
            style={{ width: 100, height: 100 }}
          />
        </View>
      )}
    />
  );
}
```

---

## Contacto

Si hay problemas con la API o la URL cambia, avísame inmediatamente.

**Checklist antes de desarrollar:**
- [ ] Puedo acceder a `https://TU-URL-NGROK.ngrok-free.app` en el navegador
- [ ] La ruta `/api/plantas` me devuelve JSON con plantas
- [ ] Puedo hacer login y recibo un token
- [ ] Las imágenes se cargan correctamente

## Testing rápido

Usa Postman o esta herramienta web para probar:
- https://reqbin.com/

O prueba directamente en el navegador:
```
https://TU-URL-NGROK.ngrok-free.app/api/plantas
```
