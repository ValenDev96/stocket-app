// Contenido corregido y seguro para: Backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- CORRECCIÓN ---
// Se añaden los middlewares de seguridad a la ruta de registro.
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// La ruta de login sigue siendo pública
router.post('/login', authController.login);

// La ruta de registro ahora es privada y solo para administradores
router.post(
    '/register', 
    protegerRuta, 
    autorizar(['Administrador']), // Solo usuarios con el rol 'Administrador' pueden acceder
    authController.register
);

module.exports = router;