const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const pool = require('../config/db');

// --- NUEVA FUNCIÓN DE REGISTRO CON TRANSACCIONES ---
exports.register = async (req, res) => {
  const { nombre_usuario, apellido, email, password, rol_id } = req.body;

  if (!nombre_usuario || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ---- PASO 1: Insertar en la tabla 'empleados' usando las columnas separadas ----
    // ANOTACIÓN: Esta consulta asume que ya ejecutaste el comando SQL para añadir las columnas
    // 'nombre_usuario' y 'apellido' a tu tabla 'empleados'.
    const empleadoQuery = 'INSERT INTO empleados (nombre_usuario, apellido, correo, rol_id) VALUES (?, ?, ?, ?)';
    const empleadoValues = [nombre_usuario, apellido, email, rol_id];
    
    const [empleadoResult] = await connection.query(empleadoQuery, empleadoValues);
    
    // ---- PASO 2: Obtener el ID del empleado recién creado ----
    const newEmpleadoId = empleadoResult.insertId;

    // ---- PASO 3: Hashear la contraseña y crear el registro en 'usuarios' ----
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const usuarioQuery = `
      INSERT INTO usuarios (nombre_usuario, apellido, email, contrasena, rol_id, activo, fecha_creacion, empleado_id) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    const usuarioValues = [nombre_usuario, apellido, email, hashedPassword, rol_id, 1, newEmpleadoId];
    
    const [usuarioResult] = await connection.query(usuarioQuery, usuarioValues);
    const newUserId = usuarioResult.insertId;

    await connection.commit();

    // ---- PASO 4: Crear el token y enviar la respuesta ----
    const token = jwt.sign(
      { id: newUserId, email: email, rol_id: rol_id, empleado_id: newEmpleadoId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuario y empleado registrados exitosamente',
      token: token
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en la transacción de registro:', error);
    
    if (error.code === 'ER_DUP_ENTRY' || (error.sqlMessage && error.sqlMessage.includes('Duplicate entry'))) {
      return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' });
    }
    
    res.status(500).json({ message: 'Error interno del servidor al registrar.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// --- FUNCIÓN DE LOGIN (se mantiene igual que la versión funcional anterior) ---
exports.login = async (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Credenciales inválidas.' });
    }

    const usuario = rows[0];

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
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