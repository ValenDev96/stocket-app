// Contenido para el nuevo archivo: Backend/routes/produccionRoutes.js

const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Roles que pueden gestionar la producción
const ROLES_PERMITIDOS = ['Administrador', 'Líder de Producción'];

/**
 * @route   POST /api/produccion/registrar
 * @desc    Registra un nuevo lote de producción y actualiza todos los stocks.
 * @access  Privado (Solo para roles autorizados)
 */
router.post(
    '/registrar',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    produccionController.registrarProduccion
);

/**
 * @route   GET /api/produccion/historial
 * @desc    Obtiene el historial de todos los lotes de producción.
 * @access  Privado (Solo para roles autorizados)
 */
router.get(
    '/historial',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    produccionController.obtenerHistorialProduccion
);

module.exports = router;