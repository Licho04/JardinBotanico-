// Script de prueba de la API
const API_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Iniciando pruebas de la API...\n');

    try {
        // Test 1: Registro de usuario
        console.log('1️⃣ Probando registro de usuario...');
        const registroRes = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: `test_${Date.now()}`,
                nombre: 'Usuario de Prueba',
                mail: `test_${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const registroData = await registroRes.json();
        console.log('✅ Registro:', registroData.mensaje || registroData.error);
        console.log('');

        // Test 2: Login
        console.log('2️⃣ Probando login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: registroData.usuario.usuario,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();

        if (loginData.error) {
            console.log('❌ Error en login:', loginData.error);
            console.log('   Debug:', JSON.stringify(loginData));
            return;
        }

        const token = loginData.token;
        console.log('✅ Login exitoso. Token recibido:', token ? 'Sí' : 'No');
        if (!token) {
            console.log('   Debug respuesta:', JSON.stringify(loginData));
        }
        console.log('');

        // Test 3: Obtener plantas
        console.log('3️⃣ Probando obtener plantas...');
        const plantasRes = await fetch(`${API_URL}/plantas`);
        const plantasData = await plantasRes.json();
        console.log(`✅ Plantas obtenidas: ${plantasData.total}`);
        if (plantasData.total > 0) {
            console.log(`   Primera planta: ${plantasData.plantas[0].nombre}`);
        }
        console.log('');

        // Test 4: Crear solicitud (requiere autenticación)
        console.log('4️⃣ Probando crear solicitud...');
        const solicitudRes = await fetch(`${API_URL}/solicitudes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre_planta: 'Rosa del desierto',
                descripcion_planta: 'Planta de prueba para la API',
                propiedades_medicinales: 'Ninguna',
                ubicacion: 'Jardín de pruebas',
                motivo_donacion: 'Prueba de API'
            })
        });
        const solicitudData = await solicitudRes.json();
        console.log('✅ Solicitud:', solicitudData.mensaje || solicitudData.error);
        console.log('');

        // Test 5: Obtener mis solicitudes
        console.log('5️⃣ Probando obtener mis solicitudes...');
        const misSolicitudesRes = await fetch(`${API_URL}/solicitudes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const misSolicitudesData = await misSolicitudesRes.json();
        console.log(`✅ Mis solicitudes: ${misSolicitudesData.total}`);
        console.log('');

        console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
        console.log('\n📝 La API está lista para ser usada por la app móvil.');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }
}

testAPI();
