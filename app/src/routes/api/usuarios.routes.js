import express from 'express';
import bcrypt from 'bcrypt';
import db from '../../config/database.js';
import { verificarToken, verificarAdmin } from '../../controllers/auth.controller.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await db.allAsync('SELECT id, usuario, nombre, correo, tipo FROM usuarios ORDER BY usuario');
        res.json(usuarios || []);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Crear usuario
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { usuario, nombre, mail, password, tipo } = req.body;
        if (!usuario || !mail || !password) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }
        const existe = await db.getAsync('SELECT usuario FROM usuarios WHERE usuario = ? OR correo = ?', [usuario, mail]);
        if (existe) {
            return res.status(400).json({ error: 'Usuario o correo ya existe' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await db.runAsync(
            'INSERT INTO usuarios (usuario, nombre, correo, password, tipo) VALUES (?, ?, ?, ?, ?)',
            [usuario, nombre || '', mail, passwordHash, tipo === '1' || tipo === 'admin' ? 'admin' : 'usuario']
        );
        res.json({ success: true, mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Actualizar usuario
router.put('/:usuario', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { usuario } = req.params;
        const { nombre, mail, password, tipo } = req.body;
        let query = 'UPDATE usuarios SET nombre = ?, correo = ?, tipo = ?';
        let params = [nombre || '', mail, tipo === '1' || tipo === 'admin' ? 'admin' : 'usuario'];
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(passwordHash);
        }
        query += ' WHERE usuario = ?';
        params.push(usuario);
        await db.runAsync(query, params);
        res.json({ success: true, mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// Eliminar usuario
router.delete('/:usuario', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { usuario } = req.params;
        // Dependencias asumiendo que el controlador de donaciones las maneja o las ignoramos por ahora
        const resUser = await db.runAsync('DELETE FROM usuarios WHERE usuario = ?', [usuario]);
        if (resUser.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

export default router;
