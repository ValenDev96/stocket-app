const express = require('express');
const cors = require('cors');
require('dotenv').config(); // dotenv cargado

const app = express();

app.use(cors());
app.use(express.json());

console.log("Cargando rutas..."); // Agrega este log
const rolesRoutes = require('./routes/rolesRoutes');
const authRoutes = require('./routes/authRoutes');
const materiasPrimasRoutes = require('./routes/materiaPrimaRoutes');

app.use('/api/roles', rolesRoutes);
app.use('/api/auth', authRoutes); // <--- Esta es la relevante para /api/auth/login
app.use('/api/materiasprimas', materiasPrimasRoutes);
console.log("Rutas de autenticación (/api/auth) configuradas para usar authRoutes."); // Agrega este log

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});