const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_PERMITIDOS = ['Administrador', 'Auxiliar Administrativo', 'Líder de Producción'];

// GET /api/pedidos -> Obtener todos los pedidos
router.get('/', protegerRuta, autorizar(ROLES_PERMITIDOS), pedidosController.obtenerTodos);

// GET /api/pedidos/:id -> Obtener un pedido específico por su ID
router.get('/:id', protegerRuta, autorizar(ROLES_PERMITIDOS), pedidosController.obtenerPorId);

// POST /api/pedidos -> Crear un nuevo pedido
router.post('/', protegerRuta, autorizar(ROLES_PERMITIDOS), pedidosController.crear);

router.put('/:id', protegerRuta, autorizar(ROLES_PERMITIDOS), pedidosController.actualizarEstado);

// PUT /api/pedidos/:id/devolver -> Marcar un pedido como devuelto
router.put('/:id/devolver', protegerRuta, autorizar(ROLES_PERMITIDOS), pedidosController.marcarComoDevuelto);

module.exports = router;