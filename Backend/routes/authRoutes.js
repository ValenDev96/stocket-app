const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
console.log("Configurando rutas en authRoutes.js: /login (POST)"); // Agrega este log

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;