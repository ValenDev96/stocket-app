import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Start from './components/Start';
import Inventory from './components/Inventory';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Forms/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import Home from './components/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} /> 
        <Route path="/Login" element={<Login />} />
        <Route path="/start" element={<Start />} />
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

