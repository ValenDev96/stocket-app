const express = require('express');
const router = express.Router();
const horasTrabajadasController = require('../controllers/horasTrabajadasController');
const { protegerRuta } = require('../middleware/authMiddleware');

// Obtener todas las horas trabajadas (admin) o por filtros
router.get('/', protegerRuta, horasTrabajadasController.obtenerTodas);

// Obtener horas trabajadas por usuario específico
router.get('/usuario/:usuario_id', protegerRuta, horasTrabajadasController.obtenerPorUsuario);

// Crear nuevo registro de horas
router.post('/', protegerRuta, horasTrabajadasController.crear);

// Actualizar registro de horas
router.put('/:id', protegerRuta, horasTrabajadasController.actualizar);

// Eliminar registro de horas
router.delete('/:id', protegerRuta, horasTrabajadasController.eliminar);

module.exports = router;