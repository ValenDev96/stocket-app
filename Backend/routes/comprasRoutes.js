const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const proveedorController = require('../controllers/proveedorController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Definimos los roles que tienen permiso para registrar una compra
const ROLES_PERMITIDOS = ['Administrador', 'Líder de Bodega'];

/**
 * @route   POST /api/compras/registrar
 * @desc    Registra una nueva compra, crea un lote y un movimiento de inventario.
 * @access  Privado (Solo para roles autorizados)
 */
router.post(
    '/',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    comprasController.registrarCompra
);

router.get('/historial', proveedorController.obtenerHistorialCompras);


module.exports = router;