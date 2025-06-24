const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const authMiddleware = require('../middleware/authMiddleware');

// ===>> CAMBIO CLAVE AQUÍ <<===
// Usamos la función específica "protegerRuta" del objeto authMiddleware
router.get('/ventas', authMiddleware.protegerRuta, reportesController.generarReporteVentas);

router.get('/productos-mas-vendidos', authMiddleware.protegerRuta, reportesController.generarReporteProductos);

module.exports = router;