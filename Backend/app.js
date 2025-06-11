const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Cargando rutas...");
// Rutas existentes
const rolesRoutes = require('./routes/rolesRoutes');
const authRoutes = require('./routes/authRoutes');
const movimientosInventarioRoutes = require('./routes/movimientosInventarioRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes'); // <-- IMPORTAR RUTAS DE PEDIDOS
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const materiasPrimasRoutes = require("./routes/materiaPrimaRoutes"); // <-- IMPORTAR RUTAS DE PROVEEDORES
// Nuevas rutas para alertas
const alertasRoutes = require('./routes/alertasRoutes'); // <-- IMPORTAR

app.use('/api/roles', rolesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/materiasprimas', materiasPrimasRoutes);
app.use('/api/movimientos', movimientosInventarioRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/orders',pedidosRoutes); // <-- USAR NUEVAS RUTAS
app.use('/api/providers',proveedoresRoutes);
app.use("/api/materias_primas", materiasPrimasRoutes); // <-- USAR NUEVAS RUTAS

console.log("Rutas de autenticación (/api/auth) configuradas.");
console.log("Rutas de materias primas (/api/materiasprimas) configuradas.");
console.log("Rutas de movimientos de inventario (/api/movimientos) configuradas.");
console.log("Rutas de alertas (/api/alertas) configuradas."); // Log de confirmación


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
