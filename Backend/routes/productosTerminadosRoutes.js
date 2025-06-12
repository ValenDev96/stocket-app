// Contenido para: Backend/routes/productosTerminadosRoutes.js

const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosTerminadosController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Rutas para Productos Terminados (protegidas)
router.get('/', protegerRuta, autorizar(['Administrador', 'Líder de Producción', 'Líder de Bodega']), productosController.obtenerTodos);
router.post('/', protegerRuta, autorizar(['Administrador', 'Líder de Producción']), productosController.crear);
router.put('/:id', protegerRuta, autorizar(['Administrador', 'Líder de Producción']), productosController.actualizar);
router.delete('/:id', protegerRuta, autorizar(['Administrador']), productosController.eliminar);

module.exports = router;