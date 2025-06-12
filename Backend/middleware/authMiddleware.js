// Contenido corregido y completo para: Backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 1. Middleware para proteger rutas (verifica si hay un token válido)
exports.protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token de la cabecera
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener el usuario desde la BD (sin la contraseña) y adjuntarlo a la solicitud
      const [usuarios] = await pool.query('SELECT id, nombre_usuario, rol_id FROM usuarios WHERE id = ?', [decoded.id]);
      
      if (usuarios.length === 0) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
      }
      
      req.usuario = usuarios[0];
      next();

    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'No autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
  }
};


// --- NUEVA FUNCIÓN ---
// 2. Middleware para autorizar por rol
exports.autorizar = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
        if (!req.usuario || !req.usuario.rol_id) {
            return res.status(403).json({ message: 'No tienes permiso para realizar esta acción (rol no identificado).' });
        }

        // Obtener el nombre del rol del usuario desde la base de datos
        const [roles] = await pool.query('SELECT nombre_rol FROM roles WHERE id = ?', [req.usuario.rol_id]);
        
        if (roles.length === 0) {
             return res.status(403).json({ message: 'No tienes permiso para realizar esta acción (rol no válido).' });
        }
        
        const nombreRolUsuario = roles[0].nombre_rol;

        // Verificar si el rol del usuario está en la lista de roles permitidos para la ruta
        if (rolesPermitidos.includes(nombreRolUsuario)) {
            next(); // El usuario tiene permiso, continuar a la siguiente función (el controlador)
        } else {
            // El usuario no tiene el rol adecuado
            return res.status(403).json({ message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` });
        }
    } catch (error) {
        console.error('Error en el middleware de autorización:', error);
        res.status(500).json({ message: 'Error del servidor al verificar permisos.' });
    }
  };
};