// Contenido corregido para: Backend/routes/materiaPrimaRoutes.js

const express = require('express');
const router = express.Router();
const materiaPrimaController = require('../controllers/materiaPrimaController');

// Importamos las funciones con los nombres correctos desde el middleware
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Definimos los roles que pueden realizar acciones de modificación
const rolesParaModificarInventario = ['Administrador', 'Líder de Bodega'];
const rolesParaVerInventario = ['Administrador', 'Líder de Bodega', 'Líder de Producción'];

// Rutas para Materias Primas

// Obtener todas las materias primas (GET /)
router.get(
    '/',
    protegerRuta,
    autorizar(rolesParaVerInventario),
    materiaPrimaController.obtenerTodasMateriasPrimas
);

// Crear una nueva materia prima (POST /)
router.post(
    '/',
    protegerRuta,
    // --- CORRECCIÓN AQUÍ ---
    autorizar(rolesParaModificarInventario), // Se usa 'autorizar'
    materiaPrimaController.crearMateriaPrima
);

// Obtener una materia prima por ID (GET /:id)
router.get(
    '/:id',
    protegerRuta,
    autorizar(rolesParaVerInventario),
    materiaPrimaController.obtenerMateriaPrimaPorId
);

// Actualizar una materia prima (PUT /:id)
router.put(
    '/:id',
    protegerRuta,
    // --- CORRECCIÓN AQUÍ ---
    autorizar(rolesParaModificarInventario), // Se usa 'autorizar'
    materiaPrimaController.actualizarMateriaPrima
);

// Eliminar una materia prima (DELETE /:id)
router.delete(
    '/:id',
    protegerRuta,
    // --- CORRECCIÓN AQUÍ ---
    autorizar(['Administrador']), // Solo el Administrador puede eliminar
    materiaPrimaController.eliminarMateriaPrima
);

// Ruta para obtener solo nombres (para dropdowns)
router.get(
    '/nombres/lista', // Ruta específica para evitar conflicto con /:id
    protegerRuta,
    autorizar(rolesParaVerInventario),
    materiaPrimaController.obtenerNombresMateriasPrimas
);


module.exports = router;