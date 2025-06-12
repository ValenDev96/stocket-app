const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');
const { protegerRuta } = require('../middleware/authMiddleware');

// Ruta para obtener los lotes de una materia prima por su ID
// GET /api/lotes/materia-prima/:id
router.get('/materia-prima/:id', protegerRuta, lotesController.obtenerLotesPorMateriaPrima);

module.exports = router;