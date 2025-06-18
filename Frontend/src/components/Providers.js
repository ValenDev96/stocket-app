import { Link, useNavigate } from 'react-router-dom'; // <-- Agrega useNavigate
import '../styles/providers.css';

function Providers() {
  const navigate = useNavigate(); // <-- Hook de navegación

  const handleRegresar = () => {
    navigate('/dashboard'); // Redirige al panel principal
  };

  return (
    <div className="providers-center-container">
      <div className="providers-card">
        <h2 className="providers-title">Gestión de Proveedores</h2>
        <div className="providers-button-group">
          <Link to="/providers/proveedor" className="providers-button blue">
            Registrar Proveedor
          </Link>
          <Link to="/register-purchase" className="providers-button green">
            Registrar Compra
          </Link>
          <Link to="/providers/historial" className="providers-button cyan">
            Historial de Compras
          </Link>
          
          <button onClick={handleRegresar} className="reg">
            ← Regresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Providers;
