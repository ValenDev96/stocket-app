const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
//hola
// Función para el registro de nuevos usuarios
exports.register = async (req, res) => {
  
  const { nombre_usuario, apellido, email, password, rol_id,empleado_id } = req.body; // Ajusta los nombres según tu formulario
  
  try {
    console.log('Datos recibidos en registro:', req.body);
    // Verificar si el usuario ya existe por email (o nombre de usuario, según tu lógica)
    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]); // O WHERE nombre_usuario = ?

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'El usuario con este email ya existe' }); // 409 Conflict
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const empleadoIdNumber = empleado_id ? Number(empleado_id) : null;


  const [result] = await pool.query(
  `INSERT INTO usuarios (nombre_usuario, apellido, contrasena, rol_id, empleado_id, activo, recordar_sesion, fecha_creacion) 
   VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
  [nombre_usuario, apellido, hashedPassword, rol_id || 2,  empleadoIdNumber] // activo=1, recordar_sesion=0 // Asigna un rol por defecto (ej: 2 para 'usuario')
    );

    const userId = result.insertId;

    // Crear un token JWT para el usuario recién registrado (opcional)
    const token = jwt.sign(
      { id: userId, email: email, rol_id: role_id || 2 }, // Ajusta la información del payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Enviar una respuesta de éxito con el token (opcional) y la información del usuario
    res.status(201).json({ // 201 Created
      message: 'Usuario registrado exitosamente',
      token: token,
      user: {
        id: userId,
        nombre_usuario: nombre_usuario,
        apellido: apellido,
        email: email,
        rol_id: rol_id || 2
      }
    });

 } catch (error) {
  console.error('Error al registrar usuario:', error);
  res.status(500).json({ message: 'Error al registrar usuario' });
}
};

// Función para el login
exports.login = async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    // Buscar al usuario en la base de datos
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Verificar la contraseña
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Crear el token JWT
    const token = jwt.sign(
      { id: usuario.id, nombre_usuario: usuario.nombre_usuario, rol_id: usuario.rol_id },
      process.env.JWT_SECRET,  // La clave secreta debe estar en el archivo .env
      { expiresIn: '1h' }  // El token expira en 1 hora
    );

    // Enviar el token al cliente
    res.json({ token,
       usuario: {
    id: usuario.id,
    nombre_usuario: usuario.nombre_usuario,
    rol_id: usuario.rol_id
  }
    });
  } catch (error) {
      console.error('Error en register:', error);
    res.status(500).json({ message: 'Error al realizar login' });
  }
};
