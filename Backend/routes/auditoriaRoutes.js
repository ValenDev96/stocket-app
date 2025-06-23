// Contenido para: Backend/routes/auditoriaRoutes.js

const express = require('express');
const router = express.Router();
const { getAuditoriaLogs } = require('../controllers/auditoriaController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// La auditoría es solo para el rol de Administrador
router.get('/', protegerRuta, autorizar(['Administrador']), getAuditoriaLogs);

module.exports = router;