
import db from '../config/database.js';

// --- REMEDIOS ---

// Obtener todos los remedios (opcionalmente filtrados por planta)
export const getRemedios = async (req, res) => {
    const { nombre_cientifico } = req.query;
    try {
        let query = "SELECT * FROM remedios";
        let params = [];

        if (nombre_cientifico) {
            query += " WHERE nombre_cientifico = ?";
            params.push(nombre_cientifico);
        }

        const remedios = await db.allAsync(query, params);

        // Para cada remedio, obtener sus relaciones
        for (let remedio of remedios) {
            remedio.pasos = await db.allAsync("SELECT * FROM pasos WHERE id_remedio = ? ORDER BY num_paso ASC", [remedio.id]);
            remedio.contraindicaciones = await db.allAsync("SELECT * FROM contraindicaciones WHERE id_remedio = ?", [remedio.id]);
            remedio.efectos_secundarios = await db.allAsync("SELECT * FROM efectos_secundarios WHERE id_remedio = ?", [remedio.id]);
            remedio.usos = await db.allAsync(`
                SELECT u.* FROM usos u 
                JOIN remedios_usos ru ON u.id = ru.id_uso 
                WHERE ru.id_remedio = ?`, [remedio.id]);
        }

        res.json(remedios);
    } catch (error) {
        console.error("Error al obtener remedios:", error);
        res.status(500).json({ error: "Error al obtener remedios" });
    }
};

// Obtener un remedio por ID
export const getRemedioById = async (req, res) => {
    const { id } = req.params;
    try {
        const remedio = await db.getAsync("SELECT * FROM remedios WHERE id = ?", [id]);
        if (!remedio) {
            return res.status(404).json({ error: "Remedio no encontrado" });
        }

        remedio.pasos = await db.allAsync("SELECT * FROM pasos WHERE id_remedio = ? ORDER BY num_paso ASC", [id]);
        remedio.contraindicaciones = await db.allAsync("SELECT * FROM contraindicaciones WHERE id_remedio = ?", [id]);
        remedio.efectos_secundarios = await db.allAsync("SELECT * FROM efectos_secundarios WHERE id_remedio = ?", [id]);
        remedio.usos = await db.allAsync(`
            SELECT u.* FROM usos u 
            JOIN remedios_usos ru ON u.id = ru.id_uso 
            WHERE ru.id_remedio = ?`, [id]);

        res.json(remedio);
    } catch (error) {
        console.error("Error al obtener remedio:", error);
        res.status(500).json({ error: "Error al obtener remedio" });
    }
};

// Crear nuevo remedio con pasos y relaciones
export const createRemedio = async (req, res) => {
    const {
        nombre, descripcion, checar_medico, tiempo_efectividad,
        parte, formato, dosis_cantidad, dosis_unidad, nombre_cientifico,
        pasos, // Array de objetos { num_paso, descripcion }
        contraindicaciones, // Array/String
        efectos_secundarios, // Array/String
        usos // Array IDs
    } = req.body;

    console.log("📥 [CREATE REMEDIO] Payload Rcvd:", JSON.stringify(req.body, null, 2));

    if (!nombre_cientifico) {
        console.error("❌ [CREATE REMEDIO] Falta nombre_cientifico");
        return res.status(400).json({ error: "Nombre científico es requerido" });
    }

    try {
        await db.run('BEGIN TRANSACTION');

        // 1. Insertar Remedio
        const result = await db.runAsync(
            `INSERT INTO remedios (
                nombre, descripcion, checar_medico, tiempo_efectividad, 
                parte, formato, dosis_cantidad, dosis_unidad, nombre_cientifico
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, descripcion, checar_medico ? 1 : 0, tiempo_efectividad || 'N/A',
                parte, formato, dosis_cantidad, dosis_unidad, nombre_cientifico
            ]
        );

        const id_remedio = result.lastID;

        // 2. Insertar Pasos
        if (pasos && Array.isArray(pasos)) {
            for (const paso of pasos) {
                await db.runAsync(
                    `INSERT INTO pasos (id_remedio, num_paso, descripcion) VALUES (?, ?, ?)`,
                    [id_remedio, paso.num_paso, paso.descripcion]
                );
            }
        }

        // 3. Insertar Contraindicaciones
        if (contraindicaciones) {
            const lista = Array.isArray(contraindicaciones) ? contraindicaciones : contraindicaciones.split(',').map(s => s.trim());
            for (const c of lista) {
                if (c) await db.runAsync("INSERT INTO contraindicaciones (descripcion, id_remedio) VALUES (?, ?)", [c, id_remedio]);
            }
        }

        // 4. Insertar Efectos Secundarios
        if (efectos_secundarios) {
            const lista = Array.isArray(efectos_secundarios) ? efectos_secundarios : efectos_secundarios.split(',').map(s => s.trim());
            for (const e of lista) {
                if (e) await db.runAsync("INSERT INTO efectos_secundarios (descripcion, id_remedio) VALUES (?, ?)", [e, id_remedio]);
            }
        }

        // 5. Insertar Usos
        if (usos) {
            const lista = Array.isArray(usos) ? usos : usos.split(',').map(s => s.trim());
            for (const u of lista) {
                if (u) await db.runAsync("INSERT INTO remedios_usos (id_remedio, id_uso) VALUES (?, ?)", [id_remedio, u]);
            }
        }

        await db.run('COMMIT');
        res.status(201).json({ message: "Remedio creado exitosamente", id: id_remedio });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error("Error al crear remedio:", error);
        res.status(500).json({ error: "Error al crear remedio" });
    }
};

// Actualizar remedio, pasos y relaciones
export const updateRemedio = async (req, res) => {
    const { id } = req.params;
    const {
        nombre, descripcion, checar_medico, tiempo_efectividad,
        parte, formato, dosis_cantidad, dosis_unidad,
        pasos,
        contraindicaciones,
        efectos_secundarios,
        usos
    } = req.body;

    try {
        await db.run('BEGIN TRANSACTION');

        // 1. Actualizar Remedio
        await db.runAsync(
            `UPDATE remedios SET 
                nombre = ?, descripcion = ?, checar_medico = ?, tiempo_efectividad = ?, 
                parte = ?, formato = ?, dosis_cantidad = ?, dosis_unidad = ?
             WHERE id = ?`,
            [
                nombre, descripcion, checar_medico ? 1 : 0, tiempo_efectividad,
                parte, formato, dosis_cantidad, dosis_unidad, id
            ]
        );

        // 2. Pasos (Borrar y recrear)
        if (pasos) {
            await db.runAsync("DELETE FROM pasos WHERE id_remedio = ?", [id]);
            if (Array.isArray(pasos)) {
                for (const paso of pasos) {
                    await db.runAsync(
                        `INSERT INTO pasos (id_remedio, num_paso, descripcion) VALUES (?, ?, ?)`,
                        [id, paso.num_paso, paso.descripcion]
                    );
                }
            }
        }

        // 3. Contraindicaciones (Borrar y recrear)
        if (contraindicaciones !== undefined) { // Check undefined to allow clearing if empty array sent
            await db.runAsync("DELETE FROM contraindicaciones WHERE id_remedio = ?", [id]);
            const lista = Array.isArray(contraindicaciones) ? contraindicaciones : (contraindicaciones ? contraindicaciones.split(',').map(s => s.trim()) : []);
            for (const c of lista) {
                if (c) await db.runAsync("INSERT INTO contraindicaciones (descripcion, id_remedio) VALUES (?, ?)", [c, id]);
            }
        }

        // 4. Efectos Secundarios (Borrar y recrear)
        if (efectos_secundarios !== undefined) {
            await db.runAsync("DELETE FROM efectos_secundarios WHERE id_remedio = ?", [id]);
            const lista = Array.isArray(efectos_secundarios) ? efectos_secundarios : (efectos_secundarios ? efectos_secundarios.split(',').map(s => s.trim()) : []);
            for (const e of lista) {
                if (e) await db.runAsync("INSERT INTO efectos_secundarios (descripcion, id_remedio) VALUES (?, ?)", [e, id]);
            }
        }

        // 5. Usos (Borrar y recrear)
        if (usos !== undefined) {
            await db.runAsync("DELETE FROM remedios_usos WHERE id_remedio = ?", [id]);
            const lista = Array.isArray(usos) ? usos : (usos ? usos.split(',').map(s => s.trim()) : []);
            for (const u of lista) {
                if (u) await db.runAsync("INSERT INTO remedios_usos (id_remedio, id_uso) VALUES (?, ?)", [id, u]);
            }
        }

        await db.run('COMMIT');
        res.json({ message: "Remedio actualizado exitosamente" });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error("Error al actualizar remedio:", error);
        res.status(500).json({ error: "Error al actualizar remedio" });
    }
};

// Eliminar remedio (Cascade eliminará pasos)
export const deleteRemedio = async (req, res) => {
    const { id } = req.params;
    try {
        await db.runAsync("DELETE FROM remedios WHERE id = ?", [id]);
        res.json({ success: true, message: "Remedio eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar remedio:", error);
        res.status(500).json({ error: "Error al eliminar remedio" });
    }
};
