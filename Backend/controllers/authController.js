const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// --- La función de registro se mantiene igual ---
exports.register = async (req, res) => {
    // ... tu código de registro existente es correcto y no necesita cambios
    const { nombre_usuario, apellido, email, password, rol_id } = req.body;

    if (!nombre_usuario || !email || !password || !rol_id) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const empleadoQuery = 'INSERT INTO empleados (nombre_usuario, apellido, correo, rol_id) VALUES (?, ?, ?, ?)';
        const empleadoValues = [nombre_usuario, apellido, email, rol_id];
        const [empleadoResult] = await connection.query(empleadoQuery, empleadoValues);
        const newEmpleadoId = empleadoResult.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const usuarioQuery = `
          INSERT INTO usuarios (nombre_usuario, apellido, email, contrasena, rol_id, activo, fecha_creacion, empleado_id) 
          VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        const usuarioValues = [nombre_usuario, apellido, email, hashedPassword, rol_id, 1, newEmpleadoId];

        await connection.query(usuarioQuery, usuarioValues);
        await connection.commit();

        res.status(201).json({
            message: 'Usuario y empleado registrados exitosamente'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error en la transacción de registro:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' });
        }

        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// --- FUNCIÓN DE LOGIN CORREGIDA Y MEJORADA ---
exports.login = async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
    }

    try {
        const query = `
          SELECT u.id, u.nombre_usuario, u.email, u.contrasena, u.rol_id, r.nombre_rol
          FROM usuarios u
          JOIN roles r ON u.rol_id = r.id
          WHERE u.email = ? AND u.activo = 1
        `;
        const [usuarios] = await pool.query(query, [email]);

        if (usuarios.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        const usuario = usuarios[0];
        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // --- MEJORA CLAVE ---
        // Nos aseguramos que el payload del token y el objeto de usuario devuelto contengan toda la información necesaria.
        const payload = {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario,
            rol_id: usuario.rol_id, // Incluimos el ID del rol
            rol_nombre: usuario.nombre_rol
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            usuario: payload // Devolvemos el mismo payload
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};