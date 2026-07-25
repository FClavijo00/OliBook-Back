// Requires
const express = require("express");
const router = express.Router();
const db = require("../src/db"); // Importa tu archivo de conexión

// Login
// Endpoint: POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = $1 AND password = $2";
    const result = await db.query(sql, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    res.status(201).json({
      message: "Usuario encontrado con éxito",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Register
// Endpoint: POST /api/users/register
router.post("/register", async (req, res) => {
  try {

    const { nombre, email, password, tipoUsuario, nombreEmpresa, codigoEmpresa } = req.body;

    let empresaID = null;

    if (tipoUsuario === 'EMPRESA') {
      const codEmpresa = await generarCodigoEmpresaUnico();
      const sqlEmpresa = "INSERT INTO empresas (nombre_empresa, codigo_empresa) VALUES ($1, $2) RETURNING id";
      const resultEmpresa = await db.query(sqlEmpresa, [nombreEmpresa, codEmpresa]);
      empresaID = resultEmpresa.rows[0].id;
    }

    else if (tipoUsuario === 'TRABAJADOR') {
      const sqlBuscarEmpresa = "SELECT id FROM empresas WHERE codigo_empresa = $1 LIMIT 1";
      const resultBuscarEmpresa = await db.query(sqlBuscarEmpresa, [codigoEmpresa.trim().toUpperCase()]);

      if (resultBuscarEmpresa.rows.length === 0) {
        return res.status(400).json({ error: "El código de empresa proporcionado no existe." });
      }

      empresaID = resultBuscarEmpresa.rows[0].id;
    }

    const sqlUsuario = `
      INSERT INTO users (nombre, email, password, rol, empresa_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, nombre, email, rol, empresa_id
    `;
    const result = await db.query(sqlUsuario, [nombre, email, password, tipoUsuario, empresaID]);
    const resultUsuario = await db.query("SELECT * FROM users WHERE id = $1", [result.rows[0].id]);

    if (tipoUsuario === 'TRABAJADOR') {
      const sqlTrabajador = "INSERT INTO trabajadores (user_id, empresa_id) VALUES ($1, $2)";
      await db.query(sqlTrabajador, [result.rows[0].id, empresaID]);
    }

    // Devolvemos los datos del usuario recién registrado
    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: resultUsuario.rows[0]
    });
  } catch (err) {
    console.error("Error al registrar el usuario:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Función para generar un número aleatorio de 4 Cifras
function generarNumero4Cifras() {
  const numero = Math.floor(Math.random() * 10000); // Genera un número aleatorio entre 0 y 9999
  return numero.toString().padStart(4, '0');
}

// Función para generar Código de Empresa Único OLIB-
async function generarCodigoEmpresaUnico() {
  let codigoUnico = false;
  let codigoFinal = '';

  while (!codigoUnico) {
    codigoFinal = `OLIB-${generarNumero4Cifras()}`;

    const existe = await db.query("SELECT * FROM empresas WHERE codigo_empresa = $1 LIMIT 1", [codigoFinal]);
    if (existe.rows.length === 0) {
      codigoUnico = true;
    }
  }

  return codigoFinal;
}
