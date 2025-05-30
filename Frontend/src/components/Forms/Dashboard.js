// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/App.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Verificar si el usuario está autenticado
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Si no está autenticado, redirigir al login
    navigate('/login');
  }

  const handleLogout = () => {
    // Eliminar al usuario de la sesión y redirigir al login
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div>
      <h2>Bienvenido al Dashboard</h2>
      <p>¡Has iniciado sesión correctamente!</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default Dashboard;
