// Contenido corregido y final para: Backend/routes/alertasRoutes.js

const express = require('express');
const router = express.Router();

// Asegúrate de que el nombre del controlador y la función sean correctos
const alertasController = require('../controllers/alertasController'); 
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_PERMITIDOS_VER_ALERTAS = ['Administrador', 'Líder de Bodega', 'Líder de Producción'];

// Ruta para obtener las alertas activas
router.get(
    '/activas',
    protegerRuta,
    // Se usa 'autorizar' que es la función correcta
    autorizar(ROLES_PERMITIDOS_VER_ALERTAS), 
    // Se usa 'obtenerAlertasActivas' que es la función correcta del controlador
    alertasController.obtenerAlertasActivas 
);

module.exports = router;