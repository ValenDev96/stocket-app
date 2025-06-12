// Contenido completo para el nuevo archivo: Backend/routes/comprasRoutes.js

const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Definimos los roles que tienen permiso para registrar una compra
const ROLES_PERMITIDOS = ['Administrador', 'Líder de Bodega'];

/**
 * @route   POST /api/compras/registrar
 * @desc    Registra una nueva compra, crea un lote y un movimiento de inventario.
 * @access  Privado (Solo para roles autorizados)
 */
router.post(
    '/registrar',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    comprasController.registrarCompra
);

// Aquí podrías agregar más rutas en el futuro, como obtener un historial de compras.

module.exports = router;