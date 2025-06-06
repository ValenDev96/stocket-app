// RUTA: backend/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Función para el registro de nuevos usuarios
exports.register = async (req, res) => {
  // Se desestructuran los campos que envía el frontend.
  const { nombre_usuario, apellido, email, password, rol_id } = req.body;

  // Validación para asegurar que los datos esenciales llegaron.
  if (!nombre_usuario || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios para el registro.' });
  }

  try {
    // Verificar si el usuario ya existe.
    const [existingUserRows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (existingUserRows.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado' });
    }

    // Hashear la contraseña.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ------> INICIO DE LA CORRECCIÓN IMPORTANTE <------
    // La consulta INSERT ahora tiene 6 columnas a rellenar con placeholders
    // y una columna ('fecha_creacion') que usa una función de SQL (NOW()).
    const sqlQuery = `
      INSERT INTO usuarios 
        (nombre_usuario, apellido, email, contrasena, rol_id, activo, fecha_creacion) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    // El array de valores tiene EXACTAMENTE 6 elementos, que corresponden a los 6 placeholders (?)
    // El '1' corresponde a la columna 'activo'.
    const values = [nombre_usuario, apellido, email, hashedPassword, rol_id, 1];
    
    const [result] = await pool.query(sqlQuery, values);
    // ------> FIN DE LA CORRECCIÓN IMPORTANTE <------

    const userId = result.insertId;

    // Crear token JWT.
    const token = jwt.sign(
      { id: userId, email: email, rol_id: rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: token,
      user: {
        id: userId,
        nombre_usuario: nombre_usuario,
        email: email,
        rol_id: rol_id
      }
    });

  } catch (error) {
    console.error('Error en el controlador de registro:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
  }
};


// Función para el login
exports.login = async (req, res) => {
  // ANOTACIÓN: El formulario de login envía 'email' y 'password'. El backend debe usar esos nombres.
  // Tu código original esperaba 'contrasena', lo que podría causar un error.
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // ANOTACIÓN: Comparar la contraseña del formulario ('password') con la hasheada de la BD ('usuario.contrasena')
    const esValida = await bcrypt.compare(password, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre_usuario: usuario.nombre_usuario, rol_id: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        rol_id: usuario.rol_id
      }
    });
  } catch (error) {
      console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};