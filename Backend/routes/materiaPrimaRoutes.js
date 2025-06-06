// Backend/routes/materiasPrimasRoutes.js
const express = require('express');
const router = express.Router();
const materiasPrimasController = require('../controllers/materiaPrimaController');
const { protegerRuta, autorizarRol } = require('../middleware/authMiddleware');

console.log('[materiasPrimasRoutes.js] Configurando rutas para materias primas...'); // Log al cargar el archivo

const rolesParaVerInventario = ['administrador', 'bodega', 'produccion'];
const rolesParaModificarInventario = ['administrador', 'bodega'];

router.post(
    '/',
    protegerRuta,
    autorizarRol(rolesParaModificarInventario), // Solo admin y bodega pueden crear
    materiasPrimasController.crearMateriaPrima
);

router.get(
    '/',
    protegerRuta,
    autorizarRol(rolesParaVerInventario),
    materiasPrimasController.obtenerTodasMateriasPrimas
);

router.get(
    '/:id',
    protegerRuta,
    autorizarRol(rolesParaVerInventario),
    materiasPrimasController.obtenerMateriaPrimaPorId
);

router.put(
    '/:id',
    protegerRuta,
    autorizarRol(rolesParaModificarInventario), // Solo admin y bodega pueden actualizar
    materiasPrimasController.actualizarMateriaPrima
);

router.delete(
    '/:id',
    protegerRuta,
    autorizarRol(rolesParaModificarInventario), // Solo admin y bodega pueden eliminar
    materiasPrimasController.eliminarMateriaPrima
);

module.exports = router;