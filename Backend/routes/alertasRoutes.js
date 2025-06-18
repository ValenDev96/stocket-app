const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_PERMITIDOS_VER_ALERTAS = ['Administrador', 'Líder de Bodega', 'Líder de Producción', 'Auxiliar Administrativo'];

// --- CORRECCIÓN ---
// La ruta ahora es '/', que se combinará con el prefijo '/api/alertas' en app.js
// para coincidir con la llamada del frontend.
router.get(
    '/',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS_VER_ALERTAS), 
    alertasController.obtenerAlertasActivas 
);

module.exports = router;