import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Inventory from './components/Inventory/GestionMateriasPrimas';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Providers from './components/Providers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import Home from './components/Home';


function App() {
  return (
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
        {/* Agrega más rutas según sea necesario */}
      </Routes>
    </Router>
  );
}

export default App;

