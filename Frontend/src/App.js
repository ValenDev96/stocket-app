// Contenido corregido para: App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Aunque Dashboard ya no usa el Context, lo dejamos aquí por si otros componentes lo necesitan.
import { AuthProvider } from './context/AuthContext'; 
import Login from './components/Login';
import Inventory from './components/Inventory/GestionMateriasPrimas';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Providers from './components/Providers';
import GestionProductosTerminados from './components/Productos/GestionProductosTerminados';
// --- CORRECCIÓN ---
// Se elimina la importación duplicada de GestionMateriasPrimas, ya se importa como 'Inventory'.
// import GestionMateriasPrimas from './components/Inventory/GestionMateriasPrimas'; 
import ProveedorForm from './components/proveedores/ProveedorForm';
import CompraForm from './components/proveedores/CompraForm';
import HistorialCompras from './components/proveedores/HistorialCompras';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import Home from './components/Home';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} /> 
          <Route path="/Login" element={<Login />} />       
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/providers/proveedor" element={<ProveedorForm />} />
          <Route path="/providers/compra" element={<CompraForm />} />
          <Route path="/providers/historial" element={<HistorialCompras />} />
          <Route path="/finished-products" element={<GestionProductosTerminados />} />
          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
