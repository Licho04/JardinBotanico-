/**
 * Script para hashear contraseñas en texto plano
 *
 * Lee usuarios de SQLite y actualiza contraseñas de texto plano a bcrypt
 */

import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

const SQLITE_PATH = './database.sqlite';

function createSQLiteConnection(path) {
    const db = new sqlite3.Database(path, (err) => {
        if (err) {
            console.error('❌ Error:', err.message);
            process.exit(1);
        }
    });

    db.runAsync = function(...args) {
        return new Promise((resolve, reject) => {
            db.run(...args, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    };

    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));

    return db;
}

async function hashPasswords() {
    const db = createSQLiteConnection(SQLITE_PATH);

    try {
        console.log('🔐 Hasheando contraseñas...\n');

        // Obtener todos los usuarios
        const usuarios = await db.allAsync('SELECT * FROM usuarios');

        console.log(`📋 Usuarios encontrados: ${usuarios.length}\n`);

        for (const usuario of usuarios) {
            console.log(`Usuario: ${usuario.usuario}`);
            console.log(`  Contraseña actual: ${usuario.password.substring(0, 20)}...`);

            // Verificar si ya está hasheada (bcrypt empieza con $2b$)
            if (usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$')) {
                console.log(`  ✅ Ya está hasheada (bcrypt)\n`);
                continue;
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(usuario.password, 10);

            // Actualizar en la base de datos
            await db.runAsync(
                'UPDATE usuarios SET password = ? WHERE usuario = ?',
                [hashedPassword, usuario.usuario]
            );

            console.log(`  🔒 Contraseña hasheada: ${hashedPassword.substring(0, 30)}...`);
            console.log(`  ✅ Actualizada\n`);
        }

        console.log('✅ ¡Todas las contraseñas han sido hasheadas!\n');

        // Mostrar resumen
        console.log('📊 RESUMEN DE USUARIOS:');
        console.log('═'.repeat(50));
        for (const usuario of usuarios) {
            console.log(`${usuario.usuario.padEnd(15)} | ${usuario.mail.padEnd(25)} | tipo: ${usuario.tipo}`);
        }
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        db.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

hashPasswords();
