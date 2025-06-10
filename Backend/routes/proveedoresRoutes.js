const express = require("express");
const router = express.Router();
const controller = require("../controllers/proveedorController");

router.post("/", controller.registrarProveedor);
router.post("/compras", controller.registrarCompra);
router.get("/:id/compras", controller.historialCompras);
router.get("/comparar/precios", controller.compararPrecios);

module.exports = router;