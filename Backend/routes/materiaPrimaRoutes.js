const express = require('express');
const router = express.Router();
const materiaPrimaController = require('../controllers/materiaPrimaController');

// Importamos los middlewares de seguridad
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

// Definición de roles permitidos por claridad
const ROLES = {
    ADMIN: 'Administrador',
    PRODUCCION: 'Líder de Producción',
    BODEGA: 'Líder de Bodega',
    AUXILIAR: 'Auxiliar Administrativo'
};

// --- Aplicando seguridad a cada endpoint ---

// GET /api/materias-primas - Listar todas
// Permitido para todos los roles que usan inventario.
router.get('/',
    protegerRuta,
    autorizar([ROLES.ADMIN, ROLES.PRODUCCION, ROLES.BODEGA, ROLES.AUXILIAR]),
    materiaPrimaController.obtenerTodasMateriasPrimas
);

// GET /api/materias-primas/nombres - Para dropdowns
// Permitido para roles que necesiten crear recetas o producciones.
router.get('/nombres',
    protegerRuta,
    autorizar([ROLES.ADMIN, ROLES.PRODUCCION]),
    materiaPrimaController.obtenerNombresMateriasPrimas
);

// POST /api/materias-primas - Crear una nueva
// Solo roles con permisos de gestión de inventario.
router.post('/',
    protegerRuta,
    autorizar([ROLES.ADMIN, ROLES.BODEGA]),
    materiaPrimaController.crearMateriaPrima
);

// GET /api/materias-primas/:id - Ver detalle
router.get('/:id',
    protegerRuta,
    autorizar([ROLES.ADMIN, ROLES.PRODUCCION, ROLES.BODEGA, ROLES.AUXILIAR]),
    materiaPrimaController.obtenerMateriaPrimaPorId
);

// PUT /api/materias-primas/:id - Actualizar
// Solo roles con permisos de gestión de inventario.
router.put('/:id',
    protegerRuta,
    autorizar([ROLES.ADMIN, ROLES.BODEGA]),
    materiaPrimaController.actualizarMateriaPrima
);

// DELETE /api/materias-primas/:id - Eliminar
// Acción crítica, solo para Administrador.
router.delete('/:id',
    protegerRuta,
    autorizar([ROLES.ADMIN]),
    materiaPrimaController.eliminarMateriaPrima
);

module.exports = router;