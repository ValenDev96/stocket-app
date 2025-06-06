// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ROLES = {
    1: 'administrador',
    2: 'auxiliar',
    3: 'bodega',
    4: 'produccion'
};

exports.protegerRuta = async (req, res, next) => {
    let token;
    console.log('[AuthMiddleware] Verificando token...'); // Log
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = {
                id: decoded.id,
                nombre_usuario: decoded.nombre_usuario,
                rol_id: decoded.rol_id,
                rol_nombre: ROLES[decoded.rol_id]
            };
            console.log('[AuthMiddleware] Token válido. Usuario:', req.usuario); // Log Detallado del Usuario

            if (!req.usuario.rol_nombre) {
                console.error(`[AuthMiddleware] Rol ID ${decoded.rol_id} no mapeado.`);
                return res.status(403).json({ message: 'Acceso prohibido. Rol de usuario desconocido.' });
            }
            next();
        } catch (error) {
            console.error('[AuthMiddleware] Error de autenticación de token:', error.message);
            return res.status(401).json({ message: 'No autorizado, el token falló o es inválido.' });
        }
    }
    if (!token) {
        console.log('[AuthMiddleware] No se proporcionó token.'); // Log
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

exports.autorizarRol = (rolesPermitidosArray) => {
    return (req, res, next) => {
        console.log(`[AuthMiddleware] Verificando autorización. Rol del usuario: ${req.usuario?.rol_nombre}. Roles permitidos: ${rolesPermitidosArray.join(', ')}`); // Log

        if (!req.usuario || !req.usuario.rol_nombre) {
            console.log('[AuthMiddleware] Usuario no autenticado o rol_nombre no disponible para autorización.'); // Log
            return res.status(401).json({ message: 'Usuario no autenticado correctamente para verificación de rol.' });
        }

        const tienePermiso = rolesPermitidosArray.includes(req.usuario.rol_nombre);
        console.log(`[AuthMiddleware] ¿Tiene permiso?: ${tienePermiso}`); // Log

        if (tienePermiso) {
            next();
        } else {
            console.log(`[AuthMiddleware] Acceso denegado para rol: ${req.usuario.rol_nombre}`); // Log
            return res.status(403).json({ message: `Acceso prohibido. Tu rol ('${req.usuario.rol_nombre}') no tiene permiso para acceder a este recurso.` });
        }
    };
};