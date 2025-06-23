// Contenido corregido para: Backend/routes/pedidosRoutes.js

const express = require('express');
const router = express.Router();

// --- CORRECCIÓN 1: Importamos la nueva función del controlador ---
const {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizarEstado,
    marcarComoDevuelto,
    obtenerPendientes // <-- Se añade la nueva función
} = require('../controllers/pedidosController');

const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_PERMITIDOS = ['Administrador', 'Auxiliar Administrativo', 'Líder de Producción'];

// --- CORRECCIÓN 2: Se añade la nueva ruta para obtener pedidos pendientes ---
// Esta ruta debe ir antes de la ruta GET /:id para que no haya conflictos.
router.get('/pendientes', protegerRuta, autorizar(ROLES_PERMITIDOS), obtenerPendientes);

// --- El resto de las rutas se mantienen igual ---
router.get('/', protegerRuta, autorizar(ROLES_PERMITIDOS), obtenerTodos);
router.get('/:id', protegerRuta, autorizar(ROLES_PERMITIDOS), obtenerPorId);
router.post('/', protegerRuta, autorizar(ROLES_PERMITIDOS), crear);

// La ruta para actualizar ahora es más específica para 'estado'
router.put('/:id/estado', protegerRuta, autorizar(ROLES_PERMITIDOS), actualizarEstado);

router.put('/:id/devolver', protegerRuta, autorizar(ROLES_PERMITIDOS), marcarComoDevuelto);


module.exports = router;