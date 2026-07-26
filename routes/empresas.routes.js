// routes/empresas.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Endpoint: GET /api/users/obtenerEmpresaUsuario
router.post("/obtenerEmpresaUsuario", async (req, res) => {
    try {
        const { id } = req.body;
        const sql = 
        `SELECT E.nombre_empresa, E.codigo_empresa 
        FROM empresas E
        INNER JOIN users U
        ON U.empresa_id = E.id 
        WHERE U.id = $1`;
        const result = await db.query(sql, [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener la empresa actual:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;