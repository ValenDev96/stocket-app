const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const rolesRoutes = require('./routes/roles');
const authRoutes = require('./routes/auth');  // Importa las rutas de login
app.use('/api/roles', rolesRoutes);
app.use('/api/auth', authRoutes);  // Rutas de autenticación

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
