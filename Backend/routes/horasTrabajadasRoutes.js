// Contenido corregido para: Backend/routes/horasTrabajadasRoutes.js

const express = require('express');
const router = express.Router();

// --- CORRECCIÓN AQUÍ: Usamos los nombres exactos del controlador ---
const {
    obtenerHoras,
    obtenerPorUsuario,
    registrarHora,
    actualizarHora,
    eliminarHora
} = require('../controllers/horasTrabajadasController');

const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_PERMITIDOS = ['Administrador'];


// --- AHORA LAS RUTAS USAN LAS FUNCIONES CON LOS NOMBRES CORRECTOS ---

router.get('/', protegerRuta, autorizar(ROLES_PERMITIDOS), obtenerHoras);

router.get('/usuario/:usuario_id', protegerRuta, autorizar(ROLES_PERMITIDOS), obtenerPorUsuario);

router.post('/', protegerRuta, autorizar(ROLES_PERMITIDOS), registrarHora);

router.put('/:id', protegerRuta, autorizar(ROLES_PERMITIDOS), actualizarHora);

router.delete('/:id', protegerRuta, autorizar(ROLES_PERMITIDOS), eliminarHora);

module.exports = router;