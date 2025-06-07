import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPedidos, crearPedido, actualizarPedido } from '../services/pedidosService';
import '../styles/Orders.css'; // Asegúrate de tener este archivo CSS


const Orders = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoPedido, setNuevoPedido] = useState({
    cliente_id: '',
    fecha_pedido: '',
    estado: 'pendiente',
    devuelto: false,
    motivo_devolucion: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    try {
      const data = await obtenerPedidos();
      setPedidos(data);
    } catch (error) {
      alert('Error al obtener pedidos');
    } finally {
      setLoading(false);
    }
  }

  // 2. Verificación de inventario antes de crear el pedido (simulada)
 async function handleCrearPedido(e) {
  e.preventDefault();
  setMensaje('');

  if (!nuevoPedido.cliente_id || !nuevoPedido.estado) {
    setMensaje('Por favor, completa los campos obligatorios.');
    return;
  }

  // Prepara el pedido para enviar, con tipo correcto y fecha opcional
  const pedidoParaEnviar = {
    ...nuevoPedido,
    cliente_id: Number(nuevoPedido.cliente_id),
    fecha_pedido: nuevoPedido.fecha_pedido || null,
  };

  try {
    await crearPedido(pedidoParaEnviar);
    setMensaje('Pedido creado exitosamente.');
    setNuevoPedido({
      cliente_id: '',
      fecha_pedido: '',
      estado: 'pendiente',
      devuelto: false,
      motivo_devolucion: ''
    });
    fetchPedidos();
  } catch (error) {
    setMensaje(error.message || 'Error al crear pedido.');
  }
}
  // 4. Marcar pedido como entregado o devuelto
  async function marcarEntregado(id) {
    try {
      await actualizarPedido(id, { estado: 'entregado' });
      fetchPedidos();
    } catch {
      alert('Error al marcar como entregado');
    }
  }

  async function marcarDevuelto(id) {
    const motivo = prompt('Motivo de la devolución:');
    if (!motivo) return;
    try {
      await actualizarPedido(id, { devuelto: true, motivo_devolucion: motivo, estado: 'devuelto' });
      fetchPedidos();
    } catch {
      alert('Error al marcar como devuelto');
    }
  }

  // Función para el botón (puedes cambiarla cuando el módulo exista)
  const handleRegistrosUsuario = () => {
    alert('Módulo "Informacion de clientes" próximamente disponible.');
  };

  const handleRegresar = () => {
    navigate('/Dashboard'); // Cambia la ruta según tu estructura
  };

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div className="orders-container">
      <h1>Pedidos</h1>
      <form onSubmit={handleCrearPedido} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Cliente ID"
          value={nuevoPedido.cliente_id}
          onChange={e => setNuevoPedido({ ...nuevoPedido, cliente_id: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Fecha Pedido"
          value={nuevoPedido.fecha_pedido}
          onChange={e => setNuevoPedido({ ...nuevoPedido, fecha_pedido: e.target.value })}
          required
        />
        <select
          value={nuevoPedido.estado}
          onChange={e => setNuevoPedido({ ...nuevoPedido, estado: e.target.value })}
          required
        >
        <option value="pendiente">Pendiente</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>

        </select>
        <button type="submit">Crear Pedido</button>
      </form>
      {mensaje && <div>{mensaje}</div>}
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente ID</th>
            <th>Fecha Pedido</th>
            <th>Estado</th>
            <th>Devuelto</th>
            <th>Motivo Devolución</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido, index) => (
            <tr key={pedido.id || pedido._id || index}>
              <td>{pedido.id || pedido._id}</td>
              <td>{pedido.cliente_id}</td>
              <td>{/* Formateo de fecha */}
                {pedido.fecha_pedido
                  ? new Date(pedido.fecha_pedido).toLocaleDateString()
                  : '-'}
              </td>
              <td>{pedido.estado}</td>
              <td>{pedido.devuelto ? 'Sí' : 'No'}</td>
              <td>{pedido.motivo_devolucion || '-'}</td>
              <td>
                {pedido.estado !== 'entregado' && (
                  <button onClick={() => marcarEntregado(pedido.id || pedido._id)}>Marcar Entregado</button>
                )}
                {!pedido.devuelto && (
                  <button onClick={() => marcarDevuelto(pedido.id || pedido._id)}>Marcar Devuelto</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="Informacion-Cliente-btn-wrapper">
        <button
          type="button"
          className="regresar-btn"
          onClick={handleRegresar}
        >
          Regresar
        </button>
        <button
          type="button"
          className="Informacion-Cliente-btn"
          onClick={handleInformacionCliente}
        >
          Información de Cliente
        </button>
      </div>
    </div>
  );
};

export default Orders;