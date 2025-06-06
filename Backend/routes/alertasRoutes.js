const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const { protegerRuta, autorizarRol } = require('../middleware/authMiddleware');

// Roles que pueden ver las alertas (ej. admin, bodega, producción)
// Ajustar según los roles que realmente necesiten esta información.
const ROLES_PERMITIDOS_VER_ALERTAS = ['administrador', 'bodega', 'produccion'];

// Obtener todas las alertas activas
router.get(
    '/activas', // La ruta completa será /api/alertas/activas
    protegerRuta,
    autorizarRol(ROLES_PERMITIDOS_VER_ALERTAS),
    alertasController.obtenerAlertasActivas
);

// Opcional: Ruta para marcar una alerta como gestionada (si implementas esa funcionalidad)
// router.put(
//     '/:alertaId/gestionar',
//     protegerRuta,
//     autorizarRol(['administrador', 'bodega']), // Solo ciertos roles podrían gestionar alertas
//     alertasController.marcarAlertaGestionada 
// );

module.exports = router;