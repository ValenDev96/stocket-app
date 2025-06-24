// Contenido 100% corregido para: Backend/routes/productosTerminadosRoutes.js

const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosTerminadosController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// --- CORRECCIÓN AQUÍ: Definimos las constantes de roles antes de usarlas ---
const ROLES_MODIFICAR = ['Administrador', 'Líder de Producción'];
const ROLES_VISUALIZAR = ['Administrador', 'Líder de Producción', 'Líder de Bodega', 'Auxiliar Administrativo'];

// GET /api/productos-terminados -> Obtiene todos los productos
router.get('/', protegerRuta, autorizar(ROLES_VISUALIZAR), productosController.obtenerTodos);

// GET /api/productos-terminados/:id -> Obtiene un solo producto
router.get('/:id', protegerRuta, autorizar(ROLES_VISUALIZAR), productosController.obtenerPorId);

// POST /api/productos-terminados -> Crea un nuevo producto
router.post('/', protegerRuta, autorizar(ROLES_MODIFICAR), productosController.crear);

// PUT /api/productos-terminados/:id -> Actualiza un producto
router.put('/:id', protegerRuta, autorizar(ROLES_MODIFICAR), productosController.actualizar);

// DELETE /api/productos-terminados/:id -> Elimina un producto
router.delete('/:id', protegerRuta, autorizar(['Administrador']), productosController.eliminar);


module.exports = router;