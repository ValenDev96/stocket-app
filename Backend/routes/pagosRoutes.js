const express = require('express');
const router = express.Router();

// --- CORRECCIÓN 1: Importación unificada y correcta ---
// Destructuramos todas las funciones del controlador que necesitamos.
const { 
    getPagos, 
    registrarPago, 
    getPagosByPedidoId 
} = require('../controllers/pagosController');

// Importamos el middleware de autenticación y autorización.
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Definimos los roles que pueden acceder a este módulo.
// Puedes ajustar estos roles según las necesidades de tu aplicación.
const ROLES_PERMITIDOS = ['Administrador', 'Auxiliar Administrativo', 'Auxiliar contable'];

// --- CORRECCIÓN 2: Aplicamos el middleware de seguridad a todas las rutas ---

/**
 * @route   GET /api/pagos
 * @desc    Obtener todos los pagos (con filtros opcionales)
 * @access  Privado
 */
router.get(
    '/',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    getPagos
);

/**
 * @route   POST /api/pagos
 * @desc    Registrar un nuevo pago
 * @access  Privado
 */
router.post(
    '/',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    registrarPago
);

/**
 * @route   GET /api/pagos/:pedidoId/pagos
 * @desc    Obtener todos los pagos para un pedido específico
 * @access  Privado
 */
router.get(
    '/:pedidoId/pagos',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    getPagosByPedidoId
);

module.exports = router;