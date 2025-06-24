// Contenido para el nuevo archivo: Backend/routes/recetasRoutes.js

const express = require('express');
const router = express.Router();
const recetasController = require('../controllers/recetasController');
const { protegerRuta } = require('../middleware/authMiddleware');

// GET /api/recetas/:productoId -> Obtener la receta de un producto
router.get('/:productoId', protegerRuta, recetasController.obtenerRecetaPorProductoId);

// POST /api/recetas -> Guardar o actualizar una receta
router.post('/', protegerRuta, recetasController.guardarReceta);

module.exports = router;