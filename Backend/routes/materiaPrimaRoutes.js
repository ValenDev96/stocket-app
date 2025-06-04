const express = require('express');
const router = express.Router();
const materiasPrimasController = require('../controllers/materiaPrimaController');
const { protegerRuta, autorizarRol } = require('../middleware/authMiddleware'); // Asegúrate que la ruta a tu middleware sea correcta

// Rutas CRUD para Materias Primas

// Crear una nueva materia prima: Solo Administrador y Líder de Bodega
router.post(
    '/',
    protegerRuta,
    autorizarRol(['administrador', 'bodega']), // Roles permitidos: 1 (admin), 3 (bodega)
    materiasPrimasController.crearMateriaPrima
);

// Obtener todas las materias primas: Administrador, Líder de Bodega, Producción
router.get(
    '/',
    protegerRuta,
    autorizarRol(['administrador', 'bodega', 'produccion']), // Roles permitidos
    materiasPrimasController.obtenerTodasMateriasPrimas
);

// Obtener una materia prima por ID: Administrador, Líder de Bodega, Producción
router.get(
    '/:id',
    protegerRuta,
    autorizarRol(['administrador', 'bodega', 'produccion']), // Roles permitidos
    materiasPrimasController.obtenerMateriaPrimaPorId
);

// Actualizar una materia prima: Solo Administrador y Líder de Bodega
router.put(
    '/:id',
    protegerRuta,
    autorizarRol(['administrador', 'bodega']), // Roles permitidos
    materiasPrimasController.actualizarMateriaPrima
);

// Eliminar una materia prima: Solo Administrador y Líder de Bodega
router.delete(
    '/:id',
    protegerRuta,
    autorizarRol(['administrador', 'bodega']), // Roles permitidos
    materiasPrimasController.eliminarMateriaPrima
);

module.exports = router;