const express = require('express');
const router = express.Router();

// --- CORRECCIÓN 1: Importación unificada ---
// Destructuramos todas las funciones que necesitamos del controlador en un solo lugar.
const {
    registrarProduccion,
    obtenerHistorialProduccion,
    iniciarProduccion,
    finalizarProduccion
} = require('../controllers/produccionController');

// Importamos el middleware que sí está definido.
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Roles que pueden gestionar la producción
const ROLES_PERMITIDOS = ['Administrador', 'Líder de Producción'];

/**
 * @route   POST /api/produccion/
 * @desc    Registra un nuevo lote de producción y actualiza todos los stocks.
 * @access  Privado (Solo para roles autorizados)
 */
// --- CORRECCIÓN 2: Ruta estandarizada a '/' ---
router.post(
    '/', // Se cambia '/registrar' por '/' para seguir la convención REST.
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    registrarProduccion // Se llama directamente a la función importada.
);

/**
 * @route   GET /api/produccion/historial
 * @desc    Obtiene el historial de todos los lotes de producción.
 * @access  Privado (Solo para roles autorizados)
 */
router.get(
    '/historial',
    protegerRuta,
    autorizar(ROLES_PERMITIDOS),
    obtenerHistorialProduccion // Se llama directamente a la función.
);


// --- CORRECCIÓN 3: Rutas PUT con el middleware correcto ---

/**
 * @route   PUT /api/produccion/:id/iniciar
 * @desc    Cambia el estado de un lote de producción a 'en_proceso'.
 * @access  Privado (Solo para roles autorizados)
 */
router.put(
    '/:id/iniciar',
    protegerRuta, // Usamos el middleware correcto.
    autorizar(ROLES_PERMITIDOS),
    iniciarProduccion // Se llama directamente.
);

/**
 * @route   PUT /api/produccion/:id/finalizar
 * @desc    Cambia el estado de un lote de producción a 'finalizado'.
 * @access  Privado (Solo para roles autorizados)
 */
router.put(
    '/:id/finalizar',
    protegerRuta, // Usamos el middleware correcto.
    autorizar(ROLES_PERMITIDOS),
    finalizarProduccion // Se llama directamente.
);


module.exports = router;