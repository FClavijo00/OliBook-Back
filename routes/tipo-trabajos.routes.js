// routes/tipo-trabajos.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Endpoint: POST /api/tipo-trabajos/obtenerTiposTrabajos
router.post("/obtenerTiposTrabajos", async (req, res) => {
    try {
        const { userID } = req.body;
        const sql = 
        `SELECT * 
        FROM tipos_trabajos 
        WHERE user_id = $1
        ORDER BY nombre ASC `;
        const result = await db.query(sql , [userID]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error al obtener los tipos de trabajos.", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Endpoint: POST /api/tipo-trabajos/nuevoTipoTrabajo
router.post("/nuevoTipoTrabajo", async (req, res) => {
    try {
        const { user_id, nombre, descripcion } = req.body;
        const nextID = (await db.query("SELECT MAX(id) AS max_id FROM tipos_trabajos")).rows[0].max_id + 1 || 0;
        const sql = `
            INSERT INTO tipos_trabajos (id, user_id, nombre, descripcion)
            VALUES ($1, $2, $3, $4)
        `;
        const result = await db.query(sql, [nextID, user_id, nombre, descripcion]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al crear el tipo de trabajo:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Endpoint: POST /api/tipo-trabajos/editarTipoTrabajo
router.post("/editarTipoTrabajo", async (req, res) => {
    try {
        const { id, user_id, nombre, descripcion } = req.body;
        const sql = `
            UPDATE tipos_trabajos
            SET nombre = $3, descripcion = $4
            WHERE id = $1
        `;
        const result = await db.query(sql, [id, user_id, nombre, descripcion]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al editar el tipo de trabajo:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Endpoint: POST /api/tipo-trabajos/eliminarTipoTrabajo
router.post("/eliminarTipoTrabajo", async (req, res) => {
    try {
        const { id } = req.body;
        const sql = "DELETE FROM tipos_trabajos WHERE id = $1";
        await db.query(sql, [id]);
        res.status(200).json({ message: "Tipo de trabajo eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar el tipo de trabajo:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});


module.exports = router;