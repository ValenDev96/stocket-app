const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Define la ruta GET / para obtener todos los roles.
// 1. `protegerRuta` verifica que el usuario haya iniciado sesión y tenga un token válido.
// 2. `autorizar(['Administrador'])` verifica que el usuario logueado tenga el rol permitido.
// 3. `rolesController.obtenerRoles` es la función del controlador que se ejecuta si las verificaciones pasan.
// (Se ha corregido 'getAllRoles' a 'obtenerRoles' para que coincida con el controlador 'rolesController.js').
router.get('/', protegerRuta, autorizar(['Administrador']), rolesController.obtenerRoles);

module.exports = router;