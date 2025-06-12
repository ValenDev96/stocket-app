// Contenido 100% corregido y funcional para: Frontend/src/components/Orders.js

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos todas las funciones que necesitamos del servicio
import { obtenerPedidos, actualizarPedido, marcarPedidoDevuelto } from '../services/pedidosService';
import '../styles/Orders.css'; // Asegúrate de que la ruta a tu CSS sea correcta

const Orders = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerPedidos();
      setPedidos(data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener pedidos:', err);
      setError(err.message || 'No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // --- FUNCIÓN CORREGIDA PARA ACTUALIZAR CUALQUIER ESTADO ---
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      // 1. Creamos el objeto con la propiedad que el backend espera: 'estado_pedido'
      const datosParaActualizar = { estado_pedido: nuevoEstado };
      
      // 2. Llamamos al servicio con el ID y los datos correctos
      await actualizarPedido(pedidoId, datosParaActualizar);
      
      // 3. Recargamos la lista para ver el cambio
      fetchPedidos();
    } catch (err) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, err);
      setError(err.message || 'No se pudo actualizar el estado del pedido.');
    }
  };

  // --- NUEVA FUNCIÓN PARA MARCAR COMO DEVUELTO ---
  const handleMarcarDevuelto = async (pedidoId) => {
    const motivo = window.prompt("Por favor, ingresa el motivo de la devolución:");
    if (motivo && motivo.trim() !== '') { // Solo si el usuario ingresa un motivo
      try {
        await marcarPedidoDevuelto(pedidoId, motivo);
        fetchPedidos(); // Recargamos la lista para ver el cambio
      } catch (err) {
        console.error("Error al marcar como devuelto:", err);
        setError(err.message || 'No se pudo marcar el pedido como devuelto.');
      }
    }
  };

  if (loading) return <div>Cargando pedidos...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="orders-container container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Pedidos</h1>
        <div>
            {/* Este botón podría llevar a un formulario de creación en el futuro */}
            <button onClick={() => alert('Formulario de creación próximamente.')} className="btn btn-primary me-2">
                <i className="fas fa-plus me-2"></i>Crear Pedido
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                <i className="fas fa-arrow-left me-2"></i>Volver al Dashboard
            </button>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha Pedido</th>
              <th>Fecha Entrega</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className={pedido.devuelto ? 'table-danger' : ''}>
                <td>{pedido.id}</td>
                <td>{pedido.cliente_nombre || 'N/A'}</td>
                <td>{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                <td>{new Date(pedido.fecha_entrega_estimada).toLocaleDateString()}</td>
                <td>${parseFloat(pedido.total_pedido).toFixed(2)}</td>
                <td>
                  <span className={`badge bg-${pedido.estado_pedido === 'completado' ? 'success' : 'warning'}`}>
                    {pedido.estado_pedido}
                  </span>
                  {pedido.devuelto && <span className="badge bg-danger ms-2">Devuelto</span>}
                </td>
                <td>
                    <select 
                        className="form-select form-select-sm"
                        value={pedido.estado_pedido}
                        onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                        disabled={pedido.estado_pedido === 'completado' || pedido.estado_pedido === 'cancelado'}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="listo_para_entrega">Listo para Entrega</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    {!pedido.devuelto && pedido.estado_pedido !== 'cancelado' && (
                         <button 
                            onClick={() => handleMarcarDevuelto(pedido.id)}
                            className="btn btn-outline-danger btn-sm mt-2"
                        >
                            Marcar Devuelto
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

export default Orders;