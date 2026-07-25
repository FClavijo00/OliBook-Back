// Importamos Express
const express = require("express");

// Inicializamos Express
const app = express();

// Definimos el puerto
const port = process.env.PORT || 3000;

// Definimos la ruta
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Cors
const cors = require("cors");
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:8100', 'https://tu-app-en-vercel.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Origin'],
}));

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();

// Rutas
const usersRoutes = require("../routes/users.routes.js");
app.use("/api/users", usersRoutes);
const parcelasRoutes = require("../routes/parcelas.routes");
app.use("/api/parcelas", parcelasRoutes);
const sigpacRoutes = require("../routes/sigpac.routes");
app.use("/api/sigpac", sigpacRoutes);
const tipoTrabajosRoutes = require("../routes/tipo-trabajos.routes");
app.use("/api/tipo-trabajos", tipoTrabajosRoutes);
const trabajosRoutes = require("../routes/trabajos.routes");
app.use("/api/trabajos", trabajosRoutes);

// Asignación de puerto dinámico para Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});