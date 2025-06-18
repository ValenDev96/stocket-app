// Contenido completo para: Frontend/src/components/Pedidos/PedidoDetalle.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerPedidoPorId } from '../../services/pedidosService';
import { toast } from 'react-toastify';

const PedidoDetalle = () => {
  const { id } = useParams(); // Obtiene el ID del pedido desde la URL
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDetalle = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerPedidoPorId(id);
      setPedido(data);
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el detalle del pedido.');
      navigate('/orders'); // Si hay un error, vuelve a la lista
    } finally {
      setCargando(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  
  if (!pedido) {
    return <div className="page-container"><h2>Pedido no encontrado</h2></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Detalle del Pedido #{pedido.id}</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Volver a Pedidos
        </button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Información del Cliente</h5>
          <p><strong>Cliente:</strong> {pedido.cliente_nombre}</p>
        </div>
        <div className="col-md-6">
          <h5>Detalles del Pedido</h5>
          <p><strong>Fecha del Pedido:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
          <p><strong>Fecha de Entrega Estimada:</strong> {new Date(pedido.fecha_entrega_estimada).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> <span className={`badge bg-${pedido.estado_pedido === 'completado' ? 'success' : 'warning'}`}>{pedido.estado_pedido}</span></p>
          <p><strong>Total del Pedido:</strong> ${parseFloat(pedido.total_pedido).toFixed(2)}</p>
        </div>
      </div>

      <hr />

      <h4>Productos en este Pedido</h4>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead className="table-light">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map(item => (
              <tr key={item.id}>
                <td>{item.producto_nombre}</td>
                <td>{item.cantidad}</td>
                <td>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                <td>${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PedidoDetalle;