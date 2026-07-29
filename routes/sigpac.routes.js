// routes/sigpac.routes.js
// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión
const axios = require('axios');
const proj4 = require('proj4');

// Configuración de proyecciones
const WGS84 = 'EPSG:4326';
const UTM30 = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';

// Endpoint: POST /api/sigpac/parcelaDesdeCoordenadas
router.post("/parcelaDesdeCoordenadas", async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Faltan coordenadas' });
        }

        // 1. Conversión de coordenadas en el servidor
        const [x, y] = proj4(WGS84, UTM30, [parseFloat(lng), parseFloat(lat)]);

        // 2. BBOX y URL del SIGPAC
        const url = `https://sigpac-hubcloud.es/servicioconsultassigpac/query/recinfobypoint/32630/${x}/${y}.json`;

        // 3. Petición al SIGPAC (Aquí no hay error de CORS)
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 5000 // 5 segundos de margen
        });

        if (!response.data) {
            return res.status(404).json({ message: 'No se encontró parcela' });
        }

    
        const data = response.data[0];

        // 4. Referencia catastral

        const ref_catastral = `https://sigpac-hubcloud.es/servicioconsultassigpac/query/refcatparcela/${data.provincia}/${data.municipio}/${data.agregado}/${data.zona}/${data.poligono}/${data.parcela}.json`

        const response2 = await axios.get(ref_catastral, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 5000 // 5 segundos de margen
        });

        data.ref_cadastral = response2.data[0].referencia_cat;

        // 5. Devolvemos el objeto limpio a Ionic
        res.json({
            poligono: data.poligono,
            parcela: data.parcela,
            provincia: data.provincia,
            municipio: data.municipio,
            superficie_ha: data.superficie,
            referencia_catastro: data.ref_cadastral,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            x: x,
            y: y,
            wkt: data.wkt
        });


    } catch (err) {
        console.error("Error al obtener las parcela por coordenadas:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Endpoint: POST /api/sigpac/actualizarCoordenadas
router.post("/actualizarCoordenadas", async (req, res) => {
    try {
        const { lat, lng, id } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Faltan coordenadas' });
        }

        const [x, y] = proj4(WGS84, UTM30, [parseFloat(lng), parseFloat(lat)]);

        const sql = "UPDATE parcelas SET x = $1, y = $2, lat = $3, lng = $4 WHERE id = $5";
        const result = await db.query(sql, [x, y, lat, lng, id]);

        const urlSIGPAC = `https://sigpac-hubcloud.es/servicioconsultassigpac/query/recinfobypoint/32630/${x}/${y}.json`;

        const response = await axios.get(urlSIGPAC, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 5000 // 5 segundos de margen
        });

        if (!response.data) {
            return res.status(404).json({ message: 'No se encontró parcela' });
        }

        const wkt = response.data[0].wkt;
        const sql2 = "UPDATE parcelas SET wkt = $1 WHERE id = $2";
        const result2 = await db.query(sql2, [wkt, id]);

        const sql3 = "SELECT * FROM parcelas WHERE id = $1";
        const result3 = await db.query(sql3, [id]);

        res.json(result3.rows[0]);
    } catch (err) {
        console.error("Error al registrar coordenadas:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;