// Contenido corregido para: Dashboard.js

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/Dashboard.css';

// --- CORRECCIÓN ---
// La ruta de importación ha sido corregida. 
// Desde 'src/components/', la ruta correcta para llegar a 'src/services/' es '../services/'.
import * as inventarioService from '../services/inventarioService';

function Dashboard() {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const usuarioString = localStorage.getItem('usuario');

  const usuario = useMemo(() => {
    return usuarioString ? JSON.parse(usuarioString) : null;
  }, [usuarioString]);

  const [alertas, setAlertas] = useState([]);
  const [cargandoAlertas, setCargandoAlertas] = useState(false);
  const [errorAlertas, setErrorAlertas] = useState('');

  const ROLES_PARA_VER_ALERTAS = useMemo(() => [1, 3, 4], []);
  const ROLES_ACCESO_PROVEEDORES = useMemo(() => [1, 2, 3], []);
  const ROLES_ACCESO_PEDIDOS = useMemo(() => [1, 2, 4], []);
  const ROLES_ACCESO_INVENTARIO = useMemo(() => [1, 3, 4], []);
  const ROLES_ACCESO_PRODUCCION = useMemo(() => [1, 3, 4], []);

  const cargarAlertas = useCallback(async () => {
    if (token && usuario && ROLES_PARA_VER_ALERTAS.includes(usuario.rol_id)) {
      setCargandoAlertas(true);
      setErrorAlertas('');
      try {
        const data = await inventarioService.getAlertasActivas();
        setAlertas(data);
      } catch (error) {
        console.error("Error al cargar alertas:", error);
        setErrorAlertas(error.message || 'No se pudieron cargar las alertas.');
      } finally {
        setCargandoAlertas(false);
      }
    } else {
      setAlertas([]);
    }
  }, [token, usuario, ROLES_PARA_VER_ALERTAS]);

  useEffect(() => {
    if (!token) {
      navigate('/Login'); 
    } else {
      cargarAlertas();
    }
  }, [token, navigate, cargarAlertas]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setAlertas([]);
    navigate('/Login'); 
  };

  const handleNavButtonClick = (section) => {
    switch (section) {
      case 'inventario': navigate('/inventory'); break;
      case 'proveedores': navigate('/providers'); break;
      case 'pedidos': navigate ('/orders'); break;
      case 'produccion': console.log('Navegar a Producción'); break; // Ruta de producción no definida en App.js
      default: console.log(`Sección no reconocida: ${section}`);
    }
  };

  if (!token || !usuario) {
    return <p>Redirigiendo al login...</p>;
  }

  const puedeVerProveedores = ROLES_ACCESO_PROVEEDORES.includes(usuario.rol_id);
  const puedeVerPedidos = ROLES_ACCESO_PEDIDOS.includes(usuario.rol_id);
  const puedeVerInventario = ROLES_ACCESO_INVENTARIO.includes(usuario.rol_id);
  const puedeVerProduccion = ROLES_ACCESO_PRODUCCION.includes(usuario.rol_id);
  const puedeVerAlertas = ROLES_PARA_VER_ALERTAS.includes(usuario.rol_id);

  const renderAlertaItem = (alerta, index) => { // Añadido index para una key más robusta
    let mensajeDetallado = alerta.mensaje_alerta;
    // La lógica de tu backend ya crea un 'mensaje' completo, así que usamos ese.
    // Si no, esta lógica de abajo es útil.
    mensajeDetallado = alerta.mensaje || 'Alerta sin descripción.';

    // Usamos el índice en la key para asegurar unicidad si los IDs de alerta pudieran repetirse entre tipos
    return (
      <li key={`${alerta.tipo_alerta}-${alerta.alerta_id || index}`} className={`alerta-item alerta-tipo-${alerta.tipo_alerta}`}>
        ⚠️ {mensajeDetallado}
      </li>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Bienvenido, {usuario?.nombre_usuario || 'Usuario'}!</h2>
        <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      </header>

      <main className="dashboard-main-content">
        <div className="start-panel-container">
          <div className="start-card">
            <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="dashboard-logo" />
            <h3 className='start-title'>Panel Principal de Acciones</h3>
            <div className="dashboard-button-group">
              {puedeVerProveedores && (<button onClick={() => handleNavButtonClick('proveedores')} className="dashboard-nav-button">Proveedores</button>)}
              {puedeVerPedidos && (<button onClick={() => handleNavButtonClick('pedidos')} className="dashboard-nav-button">Pedidos</button>)}
              {puedeVerInventario && (<button onClick={() => handleNavButtonClick('inventario')} className="dashboard-nav-button">Inventario</button>)}
              {puedeVerProduccion && (<button onClick={() => handleNavButtonClick('produccion')} className="dashboard-nav-button">Producción</button>)}
            </div>

            {puedeVerAlertas && (
              <div className="dashboard-alertas-dinamicas">
                <h4><i className="fas fa-bell"></i> Alertas de Inventario</h4>
                {cargandoAlertas && <p>Cargando alertas...</p>}
                {errorAlertas && <p className="error-message-gmp" style={{textAlign: 'left'}}>Error: {errorAlertas}</p>}
                {!cargandoAlertas && !errorAlertas && alertas.length === 0 && (
                  <p>No hay alertas activas en este momento. ¡Buen trabajo!</p>
                )}
                {!cargandoAlertas && !errorAlertas && alertas.length > 0 && (
                  <ul className="lista-alertas">
                    {alertas.map(renderAlertaItem)}
                  </ul>
                )}
              </div>
            )}
            
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