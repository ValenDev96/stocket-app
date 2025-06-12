
const express = require("express");
const router = express.Router();
const proveedorController = require("../controllers/proveedorController");
const { protegerRuta, autorizar } = require("../middleware/authMiddleware");

// --- Definición de Roles ---
const ROLES_MODIFICAR = ['Administrador', 'Líder de Bodega'];
const ROLES_VISUALIZAR = ['Administrador', 'Líder de Bodega', 'Líder de Producción', 'Auxiliar Administrativo'];

// --- Rutas para Proveedores ---
// GET /api/proveedores -> Obtiene la lista de todos los proveedores
router.get("/", protegerRuta, autorizar(ROLES_VISUALIZAR), proveedorController.obtenerProveedores);

// POST /api/proveedores -> Registra un nuevo proveedor
router.post("/", protegerRuta, autorizar(ROLES_MODIFICAR), proveedorController.registrarProveedor);

// --- Rutas para Compras a Proveedores ---
// POST /api/proveedores/compras -> Registra una nueva compra
router.post("/compras", protegerRuta, autorizar(ROLES_MODIFICAR), proveedorController.registrarCompra);

// GET /api/proveedores/compras -> Obtiene el historial de compras
router.get("/compras", protegerRuta, autorizar(ROLES_VISUALIZAR), proveedorController.obtenerHistorialCompras);

// --- Rutas para Comparación de Precios ---
// GET /api/proveedores/comparar-precios -> Compara precios
router.get("/comparar-precios", protegerRuta, autorizar(ROLES_VISUALIZAR), proveedorController.compararPrecios);

module.exports = router;