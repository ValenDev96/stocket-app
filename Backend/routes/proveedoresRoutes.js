const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// ✅ Esta debe ir antes para evitar conflicto
router.get('/historial', proveedorController.obtenerHistorialCompras);

// Rutas CRUD
router.get('/', proveedorController.obtenerProveedores);
router.get('/:id', proveedorController.obtenerProveedorPorId);
router.post('/', proveedorController.registrarProveedor);
router.put('/:id', proveedorController.actualizarProveedor);
router.put('/:id/inactivar', proveedorController.inactivarProveedor);
router.put('/:id/activar', proveedorController.activarProveedor);

module.exports = router;
