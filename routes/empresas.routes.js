// routes/empresas.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Endpoint: GET /api/users/obtenerEmpresaActual
router.get("/obtenerEmpresaActual", async (req, res) => {
    try {
        const sql = 
        `SELECT E.* FROM empresas E
        INNER JOIN users U
        ON U.empresa_id = E.id 
        WHERE U.id = $1`;
        const result = await db.query(sql, [req.user.id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener la empresa actual:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;