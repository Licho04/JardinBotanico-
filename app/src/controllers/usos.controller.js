
import db from '../config/database.js';

// Obtener todos los usos
export const obtenerUsos = async (req, res) => {
    try {
        const usos = await db.allAsync("SELECT * FROM usos ORDER BY nombre");
        // Check if request is from API or View based on accepts header or route
        // but this controller is mainly for API usage or internall calls. 
        // For admin views, we usually fetch in the route. 
        // Let's stick to API response for now or standard return.
        res.json(usos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usos" });
    }
};

// Obtener un uso por ID
export const obtenerUsoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const uso = await db.getAsync("SELECT * FROM usos WHERE id = ?", [id]);
        if (!uso) return res.status(404).json({ error: "Uso no encontrado" });
        res.json(uso);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener uso" });
    }
};

// Crear nuevo uso
export const crearUso = async (req, res) => {
    const { nombre, descripcion, tipo } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
    }

    try {
        const result = await db.runAsync(
            "INSERT INTO usos (nombre, descripcion, tipo) VALUES (?, ?, ?)",
            [nombre, descripcion, tipo]
        );
        res.status(201).json({ success: true, message: "Uso creado correctamente", id: result.lastID });
    } catch (error) {
        console.error("Error al crear uso:", error);
        res.status(500).json({ error: "Error al crear uso" });
    }
};

// Actualizar uso
export const actualizarUso = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, tipo } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
    }

    try {
        await db.runAsync(
            "UPDATE usos SET nombre = ?, descripcion = ?, tipo = ? WHERE id = ?",
            [nombre, descripcion, tipo, id]
        );
        res.json({ success: true, message: "Uso actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar uso:", error);
        res.status(500).json({ error: "Error al actualizar uso" });
    }
};

// Eliminar uso
export const eliminarUso = async (req, res) => {
    const { id } = req.params;
    try {
        // First check if it's used? The FK has ON DELETE CASCADE in init-init database.js
        // const crearTablaPlantasUsos = ... FOREIGN KEY ... ON DELETE CASCADE
        // So we can just delete.
        await db.runAsync("DELETE FROM usos WHERE id = ?", [id]);
        res.json({ success: true, message: "Uso eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar uso:", error);
        res.status(500).json({ error: "Error al eliminar uso" });
    }
};
