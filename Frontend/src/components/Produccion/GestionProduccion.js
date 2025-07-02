import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  registrarProduccion, 
  obtenerHistorialProduccion,
  iniciarProduccion,
  finalizarProduccion
} from '../../services/produccionService';
import { obtenerTodos as obtenerProductosTerminados } from '../../services/productosTerminadosService';
import { obtenerPedidosPendientes } from '../../services/pedidosService';
import { FaPlay, FaCheck, FaArrowDown } from 'react-icons/fa';
import { formatQuantity } from '../../utils/formatters';
import '../../styles/providers.css';

const GestionProduccion = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [historial, setHistorial] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  
  // Estados para el formulario de registro manual
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducida, setCantidadProducida] = useState('');

  const [pedidoOrigenId, setPedidoOrigenId] = useState(null);
  // Estados de UI
  const [cargando, setCargando] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CARGA DE DATOS ---
  const cargarDatos = useCallback(async () => {
    try {
      if (cargando) { // Solo muestra el spinner la primera vez
        setCargando(true);
      }
      const [dataHistorial, dataProductos, dataPedidos] = await Promise.all([
        obtenerHistorialProduccion(),
        obtenerProductosTerminados(),
        obtenerPedidosPendientes()
      ]);
      setHistorial(dataHistorial);
      setProductos(dataProductos);
      setPedidosPendientes(dataPedidos);
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [cargando]); // Se agrega 'cargando' como dependencia para controlar el spinner

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // Se ejecuta solo una vez al montar

  // --- MANEJADORES DE EVENTOS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const produccionData = {
        producto_terminado_id: parseInt(productoSeleccionado),
        cantidad_producida: parseInt(cantidadProducida),
        pedido_origen_id: pedidoOrigenId // <-- Enviamos el ID del pedido al backend
      };
      
      await registrarProduccion(produccionData);
      toast.success('¡Producción registrada exitosamente!');
      
      // Limpiamos el formulario y el ID de origen
      setProductoSeleccionado('');
      setCantidadProducida('');
      setPedidoOrigenId(null);
      
      cargarDatos(); // Recargamos todos los datos, lo que actualizará la lista de pendientes
    } catch (error) {
      toast.error(error.message || 'Error al registrar la producción.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleIniciar = async (id) => {
    try {
        await iniciarProduccion(id);
        toast.success('La producción ha iniciado.');

        // --- LÍNEA CLAVE AÑADIDA ---
        // Volvemos a cargar todos los datos para refrescar ambas tablas.
        cargarDatos(); 
        
    } catch (error) {
        toast.error(error.message || 'Error al iniciar la producción.');
    }
};

 const handleFinalizar = async (id) => {
    try {
        await finalizarProduccion(id);
        toast.success('La producción ha finalizado.');
        cargarDatos(); // <-- Añadir también aquí
    } catch (error) {
        toast.error(error.message || 'Error al finalizar la producción.');
    }
};

  const handlePlanificarDesdePedido = (pedido) => {
    const itemsDelPedido = pedido.items;
    
    // Guardamos el ID del pedido del que estamos planificando
    setPedidoOrigenId(pedido.id);

    if (itemsDelPedido && itemsDelPedido.length === 1) {
        const item = itemsDelPedido[0];
        setProductoSeleccionado(item.producto_id);
        setCantidadProducida(item.cantidad);
        toast.success(`Formulario rellenado para el pedido #${pedido.id}.`);
    } else {
        toast.info(`El pedido #${pedido.id} tiene varios productos. Regístralos manualmente.`);
    }
    window.scrollTo({
        top: document.querySelector('.filter-card:nth-of-type(2)').offsetTop,
        behavior: 'smooth'
    });
  };

  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'planificado': return 'secondary';
      case 'en_proceso': return 'primary';
      case 'finalizado': return 'success';
      default: return 'dark';
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="gestion-proveedores-page">
      <div className="page-header-modern">
        <h2>Gestión de producción</h2>
      </div>

      {/* Tarjeta de Pedidos Pendientes */}
      <div className="filter-card mb-4">
        <h5 className="filter-title">Pedidos Pendientes de Producir</h5>
        {pedidosPendientes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm table-hover table-bordered">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha de Entrega</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientes.map(pedido => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{pedido.cliente_nombre}</td>
                    <td>{new Date(pedido.fecha_entrega_estimada).toLocaleDateString()}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 mx-auto"
                        onClick={() => handlePlanificarDesdePedido(pedido)}
                      >
                        <FaArrowDown /> Planificar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center pt-3">¡Excelente! No hay pedidos pendientes de producción.</p>
        )}
      </div>

      {/* Tarjeta de Registro Manual */}
      <div className="filter-card">
        <h5 className="filter-title">Registrar nueva producción</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label htmlFor="productoSelect" className="form-label">Producto a Fabricar</label>
              <select id="productoSelect" className="form-select" value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} required>
                <option value="">Seleccione un producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="cantidadInput" className="form-label">Cantidad a Producir</label>
              <input type="number" id="cantidadInput" className="form-control" value={cantidadProducida} onChange={(e) => setCantidadProducida(e.target.value)} required min="1" />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabla de Historial de Producción */}
      <div className="table-responsive mt-4">
        <h4>Historial de Producción</h4>
        <table className="table table-hover table-modern table-bordered">
          {/* 1. Cabecera con 6 columnas */}
          <thead>
            <tr>
              <th>Id Lote</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(lote => (
              <tr key={lote.id}>
                {/* 2. Fila con exactamente 6 celdas que corresponden a las cabeceras */}
                <td>{lote.id}</td>
                <td>{new Date(lote.fecha_produccion).toLocaleDateString()}</td>
                <td>{lote.producto_nombre}</td>
                <td>{formatQuantity(lote.cantidad_producida)}</td>
                <td>
                  <span className={`badge bg-${getBadgeColor(lote.estado)}`}>
                    {lote.estado}
                  </span>
                </td>
                <td className="text-center">
                  {lote.estado === 'planificado' && (
                    <button className="circular-icon-button green" title="Iniciar Proceso" onClick={() => handleIniciar(lote.id)}>
                      <FaPlay />
                    </button>
                  )}
                  {lote.estado === 'en_proceso' && (
                    <button className="circular-icon-button" style={{backgroundColor: '#0d6efd'}} title="Finalizar Producción" onClick={() => handleFinalizar(lote.id)}>
                      <FaCheck />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionProduccion;