// routes/trabajos.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Función para traer los últimos trabajos realizados
// Endpoint: GET /api/trabajos/
router.get("/obtenerUltimosTrabajos", async (req, res) => {
    try {
        const sql = 
        `
        SELECT TR.*, P.nombre_parcela, P.apodo_parcela, TT.nombre
        FROM trabajos_realizados TR
        INNER JOIN parcelas P
        ON P.id = TR.parcela_id
        INNER JOIN tipos_trabajos TT
        ON TT.id = TR.tipo_trabajo_id
        ORDER BY TR.fecha_trabajo DESC
        LIMIT 5
        `;
        const result = await db.query(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error al obtener los últimos trabajos.", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});


module.exports = router;