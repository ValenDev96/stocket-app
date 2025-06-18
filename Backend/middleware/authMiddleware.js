const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Middleware para proteger rutas que requieren autenticación
exports.protegerRuta = async (req, res, next) => {
    let token;

    // Buscamos el token en el encabezado 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraemos el token (formato: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verificamos y decodificamos el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscamos el usuario en la BD usando el id del token y lo adjuntamos al request
            // Nos aseguramos de traer el nombre del rol con un JOIN
            const query = `
                SELECT u.id, u.nombre_usuario, u.rol_id, r.nombre_rol 
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.id = ?
            `;
            const [rows] = await pool.query(query, [decoded.id]);
            
            if (rows.length === 0) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
            }

            req.usuario = rows[0]; // Adjuntamos el usuario al objeto 'req'
            next(); // Continuamos a la siguiente función (el controlador)

        } catch (error) {
            console.error('Error de autenticación:', error);
            return res.status(401).json({ message: 'No autorizado, token inválido.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó un token.' });
    }
};

// Middleware para autorizar basado en roles
// Recibe un array de nombres de roles permitidos
exports.autorizar = (rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario fue adjuntado en el middleware 'protegerRuta'
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.nombre_rol)) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes el rol requerido.' });
        }
        next(); // El usuario tiene el rol correcto, puede continuar
    };
};