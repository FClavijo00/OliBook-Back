// routes/parcelas.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

router.post("/obtenerParcelas", async (req, res) => {
    try {
        const { userID } = req.body;
        const sql = "SELECT * FROM parcelas WHERE user_id = $1";
        const result = await db.query(sql, [userID]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener las parcelas:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;