// Contenido 100% corregido y con nuevo estilo para: Frontend/src/components/Orders.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerPedidos, actualizarPedido, marcarPedidoDevuelto } from '../services/pedidosService';
import { toast } from 'react-toastify';
// --- IMPORTACIÓN AÑADIDA ---
import Dropdown from 'react-bootstrap/Dropdown';
import '../styles/Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPedidos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await obtenerPedidos();
            setPedidos(data);
        } catch (error) {
            toast.error(error.message || 'No se pudieron cargar los pedidos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
        try {
            await actualizarPedido(pedidoId, { estado_pedido: nuevoEstado });
            toast.success(`Pedido #${pedidoId} actualizado a '${nuevoEstado}'.`);
            fetchPedidos();
        } catch (error) {
            toast.error(error.message || 'No se pudo actualizar el estado.');
        }
    };

    const handleMarcarDevuelto = async (pedidoId) => {
        const motivo = window.prompt("Por favor, ingresa el motivo de la devolución:");
        if (motivo && motivo.trim() !== '') {
            try {
                await marcarPedidoDevuelto(pedidoId, motivo);
                toast.success(`Pedido #${pedidoId} marcado como devuelto.`);
                fetchPedidos();
            } catch (error) {
                toast.error(error.message || 'No se pudo marcar como devuelto.');
            }
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Gestión de Pedidos</h2>
                <button onClick={() => navigate('/orders/new')} className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Crear Pedido
                </button>
            </div>
            
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>ID Pedido</th>
                            <th>Cliente</th>
                            <th>Fecha Pedido</th>
                            <th>Fecha Entrega</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((pedido) => (
                            <tr key={pedido.id} className={pedido.devuelto ? 'table-danger' : ''}>
                                <td><Link to={`/orders/${pedido.id}`}>{pedido.id}</Link></td>
                                <td>{pedido.cliente_nombre || 'N/A'}</td>
                                <td>{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                                <td>{new Date(pedido.fecha_entrega_estimada).toLocaleDateString()}</td>
                                <td>${parseFloat(pedido.total_pedido).toFixed(2)}</td>
                                <td>
                                    <span className={`badge bg-${pedido.estado_pedido === 'completado' ? 'success' : 'warning'}`}>
                                        {pedido.estado_pedido}
                                    </span>
                                    {pedido.devuelto ? <span className="badge bg-danger ms-2">Devuelto</span> : ''}
                                </td>
                                {/* --- COLUMNA DE ACCIONES MEJORADA --- */}
                                <td className="text-center">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => cambiarEstadoPedido(pedido.id, 'en_proceso')} disabled={pedido.estado_pedido !== 'pendiente'}>
                                                Marcar como "En Proceso"
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => cambiarEstadoPedido(pedido.id, 'listo_para_entrega')} disabled={pedido.estado_pedido !== 'en_proceso'}>
                                                Marcar como "Listo para Entrega"
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => cambiarEstadoPedido(pedido.id, 'completado')} disabled={pedido.estado_pedido !== 'listo_para_entrega'}>
                                                Marcar como "Completado"
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={() => cambiarEstadoPedido(pedido.id, 'cancelado')} className="text-danger" disabled={pedido.estado_pedido === 'completado' || pedido.estado_pedido === 'cancelado'}>
                                                Cancelar Pedido
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleMarcarDevuelto(pedido.id)} className="text-danger" disabled={pedido.devuelto || pedido.estado_pedido !== 'completado'}>
                                                Marcar como Devuelto
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
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