const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailHelper');


exports.register = async (req, res) => {
    const { nombre_usuario, apellido, email, password, rol_id } = req.body;
    const admin_id = req.usuario.id; // ID del admin que realiza la acción

    if (!nombre_usuario || !email || !password || !rol_id) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [empleadoResult] = await connection.query(
            'INSERT INTO empleados (nombre_usuario, apellido, correo, rol_id) VALUES (?, ?, ?, ?)',
            [nombre_usuario, apellido, email, rol_id]
        );
        const newEmpleadoId = empleadoResult.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [usuarioResult] = await connection.query(
            'INSERT INTO usuarios (nombre_usuario, apellido, email, contrasena, rol_id, activo, empleado_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre_usuario, apellido, email, hashedPassword, rol_id, 1, newEmpleadoId]
        );
        const newUserId = usuarioResult.insertId;

        // --- AUDITORÍA: Se registra la creación del usuario ---
        const detallesAuditoria = `Admin (ID: ${admin_id}) creó al usuario '${nombre_usuario}' (ID: ${newUserId}).`;
        await connection.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
            [admin_id, 'CREAR', 'usuarios', newUserId, detallesAuditoria]
        );

        await connection.commit();
        res.status(201).json({ message: 'Usuario y empleado registrados exitosamente' });

    } catch (error) {
        await connection.rollback();
        // ... (tu manejo de errores)
    } finally {
        if (connection) connection.release();
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

// @desc    Maneja la petición de "Olvidé mi contraseña"
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        if (users.length === 0) {
            // Nota de seguridad: No revelamos si el email existe o no.
            return res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
        }
        const user = users[0];

        // Generar un token de reseteo
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // El token expira en 10 minutos
        const tokenExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Guardar el token hasheado y la fecha de expiración en la base de datos
        await pool.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [hashedToken, tokenExpires, user.id]
        );

        // Crear la URL de reseteo (asegúrate que el frontend corre en el puerto 3001)
        const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
        
        // Enviar el correo
        await sendEmail({
            to: user.email,
            subject: 'Restablecimiento de Contraseña - Stocket App',
            html: `<p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace (válido por 10 minutos) para continuar:</p>
                   <a href="${resetUrl}">${resetUrl}</a>`
        });

        res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};


exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()',
            [hashedToken]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }
        const user = users[0];

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Actualizar la contraseña y limpiar los campos de reseteo
        await pool.query(
            'UPDATE usuarios SET contrasena = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};