// Frontend/src/components/Dashboard/Dashboard.js (o donde lo tengas)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

function Dashboard() {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  useEffect(() => {
    if (!token) {
      navigate('/Login'); 
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/Login'); 
  };

  // Simula la funcionalidad de los botones de Start.js
  const handleNavButtonClick = (section) => {
    switch (section) {
      case 'inventario':
        navigate('/inventory'); // O '/gestion-inventario' si esa es tu ruta
        break;
      case 'proveedores':
        console.log('Navegar a Proveedores');
        // navigate('/ruta-proveedores'); // Futura implementación
        break;
      case 'pedidos':
        console.log('Navegar a Pedidos');
        // navigate('/ruta-pedidos'); // Futura implementación
        break;
      case 'produccion':
        console.log('Navegar a Producción');
        // navigate('/ruta-produccion'); // Futura implementación
        break;
      default:
        console.log(`Sección no reconocida: ${section}`);
    }
  };

  if (!token) {
    return <p>Redirigiendo al login...</p>; // O un spinner de carga
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Bienvenido, {usuario?.nombre_usuario || 'Usuario'}!</h2>
        <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      </header>

      <main className="dashboard-main-content">
        <div className="start-panel-container"> {/* Contenedor para la tarjeta principal */}
          <div className="start-card">
            <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="dashboard-logo" />
            <h3 className='start-title'>Panel Principal de Acciones</h3>
            <div className="dashboard-button-group">
              <button onClick={() => handleNavButtonClick('proveedores')} className="dashboard-nav-button">Proveedores</button>
              <button onClick={() => handleNavButtonClick('pedidos')} className="dashboard-nav-button">Pedidos</button>
              <button onClick={() => handleNavButtonClick('inventario')} className="dashboard-nav-button">Inventario</button>
              <button onClick={() => handleNavButtonClick('produccion')} className="dashboard-nav-button">Producción</button>
            </div>
            <div className="dashboard-alert">
              ⚠️ Alerta: Algunos productos están bajos en inventario (ejemplo).
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Stocket - Empanadas Emanuel</p>
      </footer>
    </div>
  );
}

export default Dashboard;