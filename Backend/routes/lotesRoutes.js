// Contenido 100% corregido para: Backend/routes/lotesRoutes.js

const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_GENERALES = ['Administrador', 'Líder de Bodega', 'Líder de Producción'];
const ROLES_MODIFICAR = ['Administrador', 'Líder de Bodega'];

// Ruta para obtener los lotes de una materia prima por su ID
// GET /api/lotes/materia-prima/:id
router.get('/materia-prima/:id', protegerRuta, autorizar(ROLES_GENERALES), lotesController.obtenerLotesPorMateriaPrima);


// --- RUTA AÑADIDA ---
// Ruta para "eliminar" (descartar) un lote por su ID
// DELETE /api/lotes/:id
router.delete('/:id', protegerRuta, autorizar(ROLES_MODIFICAR), lotesController.descartarLote);


module.exports = router;