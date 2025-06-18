// Contenido para: Backend/routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { protegerRuta } = require('../middleware/authMiddleware');

// GET /api/clientes -> Obtener todos los clientes
router.get('/', protegerRuta, clientesController.obtenerTodos);

module.exports = router;