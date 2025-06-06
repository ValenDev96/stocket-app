const express = require('express');
const router = express.Router();
const movimientosInventarioController = require('../controllers/movimientosInventarioController');
const { protegerRuta, autorizarRol } = require('../middleware/authMiddleware');

// Roles que pueden registrar movimientos y ver historial (ajustar según necesidad)
const ROLES_PERMITIDOS_GESTION_MOVIMIENTOS = ['administrador', 'bodega'];
const ROLES_PERMITIDOS_VER_MOVIMIENTOS = ['administrador', 'bodega', 'produccion'];

// Registrar un nuevo movimiento de inventario (entrada o salida)
// La materia_prima_id se espera en el cuerpo de la solicitud
router.post(
    '/',
    protegerRuta,
    autorizarRol(ROLES_PERMITIDOS_GESTION_MOVIMIENTOS),
    movimientosInventarioController.registrarMovimiento
);

// Obtener el historial de movimientos para una materia prima específica
router.get(
    '/:materiaPrimaId', // El ID de la materia prima se pasa como parámetro en la URL
    protegerRuta,
    autorizarRol(ROLES_PERMITIDOS_VER_MOVIMIENTOS),
    movimientosInventarioController.obtenerMovimientosPorMateriaPrima
);

module.exports = router;