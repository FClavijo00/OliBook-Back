// routes/parcelas.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Obtener Parcelas
// Endpoint: POST /api/parcelas/obtenerParcelas
router.post("/obtenerParcelas", async (req, res) => {
    try {
        const { userID } = req.body;
        const sql = `
        SELECT 
            P.*,
            COALESCE(w_json.lista_trabajos, '[]'::json) AS trabajos
        FROM parcelas P
        LEFT JOIN LATERAL (
            SELECT json_agg(json_build_object(
                'id', TR.id,
                'tipo_trabajo_nombre', TT.nombre,
                'fecha', TR.fecha_trabajo,
                'observaciones', TR.observaciones
            )) AS lista_trabajos
            FROM trabajos_realizados TR
            INNER JOIN tipos_trabajos TT
            ON TT.id = TR.tipo_trabajo_id
            WHERE TR.parcela_id = P.id
        ) w_json ON true
        WHERE P.user_id = $1
        ORDER BY P.nombre_parcela ASC
        ` ;
        const result = await db.query(sql, [userID]);
        res.status(201).json({
            message: "Parcelas obtenidas con éxito",
            parcelas: result.rows[0]
        });
    } catch (error) {
        console.error("Error al obtener las parcelas:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Nueva Parcela
// Endpoint: POST /api/parcelas/nuevaParcela
router.post("/nuevaParcela", async (req, res) => {
    try {
        const { user_id, empresa_id, nombre_parcela, apodo_parcela, provincia, municipio, poligono, parcela, superficie_ha, referencia_cadastral, observaciones, lat, lng, x, y, wkt } = req.body;
        const sql = `
            INSERT INTO parcelas (user_id, empresa_id, nombre_parcela, apodo_parcela, provincia, municipio, poligono, parcela, superficie_ha, referencia_cadastral, observaciones, lat, lng, x, y, wkt)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `;
        const result = await db.query(sql, [user_id, empresa_id, nombre_parcela, apodo_parcela, provincia, municipio, poligono, parcela, superficie_ha, referencia_cadastral, observaciones, lat, lng, x, y, wkt]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al crear la parcela:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Editar Parcela
// Endpoint: POST /api/parcelas/editarParcela
router.post("/editarParcela", async (req, res) => {
    try {
        const { id, nombre_parcela, apodo_parcela, provincia, municipio, poligono, parcela, superficie_ha, observaciones } = req.body;
        const sql = `
            UPDATE parcelas
            SET
                nombre_parcela = $1,
                apodo_parcela = $2,
                provincia = $3,
                municipio = $4,
                poligono = $5,
                parcela = $6,
                superficie_ha = $7,
                observaciones = $8
            WHERE id = $9
        `;
        await db.query(sql, [nombre_parcela, apodo_parcela, provincia, municipio, poligono, parcela, superficie_ha, observaciones, id]);

        const result = await db.query("SELECT * FROM parcelas WHERE id = $1", [id]);
        res.status(201).json({
            message: "Parcela editada con éxito",
            parcela: result.rows[0]
        });
    } catch (error) {
        console.error("Error al editar la parcela:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Eliminar Parcela
// Endpoint: POST /api/parcelas/eliminarParcela
router.post("/eliminarParcela", async (req, res) => {
    try {
        const { id } = req.body;
        const sql = "DELETE FROM parcelas WHERE id = $1";
        await db.query(sql, [id]);
        res.status(200).json({ message: "Parcela eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar la parcela:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});



module.exports = router;