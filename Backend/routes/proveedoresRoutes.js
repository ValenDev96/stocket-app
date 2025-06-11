const express = require("express");
const router = express.Router();
const controller = require("../controllers/proveedorController");
const materiaPrimaController = require("../controllers/materiaPrimaController");
const { protegerRuta } = require("../middleware/authMiddleware");

// Rutas
router.post("/", controller.registrarProveedor);
router.post("/compras", controller.registrarCompra);
router.get("/compras", controller.obtenerHistorialCompras); // ✅ Usa la función que SÍ existe
router.get("/comparar/precios", controller.compararPrecios);
router.get("/", controller.obtenerProveedores); // ✅ corregido
router.get("/materias_primas", protegerRuta, materiaPrimaController.obtenerMateriasPrimas);
router.get("/historial", controller.obtenerHistorialCompras);

// Exportar
module.exports = router;
