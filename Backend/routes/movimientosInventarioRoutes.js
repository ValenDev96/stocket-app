// Contenido corregido para: Backend/routes/movimientosInventarioRoutes.js

const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosInventarioController');
// Se importa 'autorizar', que es el nombre correcto de la función en el middleware
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Se definen los roles que tienen permiso para gestionar movimientos
const ROLES_PERMITIDOS_GESTION_MOVIMIENTOS = ['Administrador', 'Líder de Bodega'];

// Ruta para registrar un nuevo movimiento
router.post(
    '/',
    protegerRuta,
    // --- CORRECCIÓN AQUÍ ---
    // Se usa 'autorizar' en lugar de 'autorizarRol'
    autorizar(ROLES_PERMITIDOS_GESTION_MOVIMIENTOS),
    movimientosController.registrarMovimiento // Asegúrate de que este nombre coincida con tu controlador
);

// Ruta para obtener el historial de movimientos de una materia prima específica
router.get(
    '/:materiaPrimaId',
    protegerRuta,
    // --- CORRECCIÓN AQUÍ ---
    // Se usa 'autorizar' en lugar de 'autorizarRol'
    autorizar(ROLES_PERMITIDOS_GESTION_MOVIMIENTOS),
    movimientosController.obtenerMovimientosPorMateriaPrima // Asegúrate de que este nombre coincida con tu controlador
);

module.exports = router;