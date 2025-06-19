// Contenido para: Backend/routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { protegerRuta } = require('../middleware/authMiddleware');

// GET /api/clientes -> Obtener todos los clientes
router.get('/', protegerRuta, clientesController.obtenerTodos);
router.post('/', protegerRuta, clientesController.crearCliente);
router.put('/:id', protegerRuta, clientesController.actualizarCliente);
router.delete('/:id', protegerRuta, clientesController.eliminarCliente);


module.exports = router;