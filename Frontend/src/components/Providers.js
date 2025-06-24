import { useNavigate } from 'react-router-dom';
import '../styles/providers.css'; // Importamos el CSS corregido
import { FaUserPlus, FaCartPlus, FaHistory, FaCogs } from 'react-icons/fa'; // Iconos

function Providers() {
  const navigate = useNavigate();

  return (
    // Contenedor principal de la página con un fondo suave
    <div className="providers-page-container">
      {/* Tarjeta principal que contiene todo el módulo */}
      <div className="providers-main-card">
        <div className="providers-header">
          <h2>Gestión de Proveedores</h2>
          <p>Administra tus proveedores, registra compras y consulta el historial.</p>
        </div>

        {/* Contenedor para las tarjetas de estadísticas */}
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-number">6</span>
            <span className="stat-label">Proveedores registrados</span>
          </div>
          <div className="stat-card">
            <span className="stat-number-alt">+14</span>
            <span className="stat-label">Compras registradas</span>
          </div>
        </div>

        {/* Contenedor para los botones de acción */}
        <div className="action-buttons-container">
          <button className="action-btn primary" onClick={() => navigate('/providers/proveedor')}>
            <FaUserPlus /> Registrar Proveedor
          </button>
          <button className="action-btn success" onClick={() => navigate('/register-purchase')}>
            <FaCartPlus /> Registrar Compra
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/providers/historial')}>
            <FaHistory /> Historial de Compras
          </button>
          <button className="action-btn info" onClick={() => navigate('/providers/gestion')}>
            <FaCogs /> Gestión de Proveedores
          </button>
        </div>
      </div>
    </div>
  );
}

export default Providers;
