const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protegerRuta } = require('../middleware/authMiddleware');

// Definimos la ruta para obtener las estadísticas.
// Solo necesita estar protegido por inicio de sesión, ya que el dashboard es para todos.
router.get('/stats', protegerRuta, dashboardController.obtenerEstadisticas);

module.exports = router;