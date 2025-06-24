// Contenido para: Backend/routes/usuariosRoutes.js

const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../controllers/usuariosController');
const { protegerRuta, autorizar } = require('../middleware/authMiddleware');

const ROLES_ADMIN = ['Administrador'];

// Todas las rutas de gestión de usuarios son solo para el Administrador
router.use(protegerRuta, autorizar(ROLES_ADMIN));

// GET /api/usuarios -> Obtener todos los usuarios
router.get('/', getAllUsers);

// PUT /api/usuarios/:id -> Actualizar un usuario
router.put('/:id', updateUser);

// DELETE /api/usuarios/:id -> Eliminar un usuario
router.delete('/:id', deleteUser);

module.exports = router;