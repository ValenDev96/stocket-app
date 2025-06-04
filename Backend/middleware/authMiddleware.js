const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para acceder a process.env.JWT_SECRET

// Mapa de IDs de rol a nombres de rol (basado en tu BD y uso)
// Asegúrate de que estos nombres coincidan con los que usas en `autorizarRol` en tus archivos de rutas.
const ROLES = {
    1: 'administrador',
    2: 'auxiliar', // En tu Register.js lo llamas 'Contable'
    3: 'bodega',
    4: 'produccion'
    // Añade más si es necesario
};

/**
 * Middleware para proteger rutas.
 * Verifica si hay un token JWT válido en la cabecera Authorization.
 * Si es válido, adjunta la información del usuario (incluyendo nombre del rol) a req.usuario.
 */
exports.protegerRuta = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header: "Bearer TOKEN_AQUI" -> "TOKEN_AQUI"
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar el usuario decodificado (que incluye id y rol_id) a la solicitud
            // y también el nombre del rol para facilitar la autorización.
            req.usuario = {
                id: decoded.id,
                nombre_usuario: decoded.nombre_usuario, // Si lo incluyes en el token
                rol_id: decoded.rol_id,
                rol_nombre: ROLES[decoded.rol_id] // Mapear rol_id a nombre
            };

            if (!req.usuario.rol_nombre) {
                console.error(`Rol ID ${decoded.rol_id} no encontrado en el mapeo ROLES.`);
                return res.status(403).json({ message: 'Acceso prohibido. Rol de usuario desconocido.' });
            }

            next(); // Continuar al siguiente middleware o controlador
        } catch (error) {
            console.error('Error de autenticación de token:', error.message);
            return res.status(401).json({ message: 'No autorizado, el token falló o es inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

/**
 * Middleware para autorizar roles específicos.
 * @param {Array<String>} rolesPermitidos - Un array de nombres de roles que tienen permiso.
 * Ejemplo de uso: autorizarRol(['administrador', 'bodega'])
 */
exports.autorizarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario y req.usuario.rol_nombre deben ser establecidos por protegerRuta
        if (!req.usuario || !req.usuario.rol_nombre) {
            return res.status(401).json({ message: 'Usuario no autenticado correctamente para verificación de rol.' });
        }

        const tienePermiso = rolesPermitidos.includes(req.usuario.rol_nombre);

        if (tienePermiso) {
            next(); // El usuario tiene uno de los roles permitidos, continuar.
        } else {
            return res.status(403).json({ message: `Acceso prohibido. Tu rol ('${req.usuario.rol_nombre}') no tiene permiso para acceder a este recurso.` });
        }
    };
};