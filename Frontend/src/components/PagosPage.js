import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { getPagos } from '../services/pagosService';
import RegistrarPagoModal from '../components/Pagos/RegistrarPagoModal';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
// Importamos los iconos y los estilos modernos
import { FaCalendarAlt, FaRedo } from 'react-icons/fa';
import '../styles/providers.css'; // Asegúrate de que esta ruta sea correcta

const PagosPage = () => {
    const navigate = useNavigate();
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegistroModal, setShowRegistroModal] = useState(false);
    const [filters, setFilters] = useState({
        pedidoId: '',
        metodoPago: '',
        fechaDesde: '',
        fechaHasta: ''
    });

    // --- TODA LA LÓGICA DE JAVASCRIPT SE MANTIENE IGUAL ---
    const fetchPagos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPagos(filters);
            setPagos(data);
        } catch (err) {
            console.error("Error al obtener pagos:", err);
            setError("No se pudieron cargar los pagos. " + (err.message || ''));
            Swal.fire('Error', err.message || 'No se pudieron cargar los pagos.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            pedidoId: '',
            metodoPago: '',
            fechaDesde: '',
            fechaHasta: ''
        });
    };

    const handleRegistroClick = () => {
        setShowRegistroModal(true);
    };

    const handleCloseRegistroModal = () => {
        setShowRegistroModal(false);
    };

    const handleSavePago = () => {
        fetchPagos();
    };

    if (loading) {
        return <div className="text-center p-4">Cargando pagos...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-danger">{error}</div>;
    }

    // --- EL JSX ES LA PARTE QUE SE REFRACTORIZA ---
    return (
        <div className="gestion-proveedores-page"> {/* Clase base para el fondo y padding */}
            
            {/* Encabezado moderno */}
            <div className="page-header-modern">
                <h2>Gestión de pagos</h2>
                <div className="header-buttons">
                    <button className="btn btn-primary" onClick={handleRegistroClick}>
                        Registrar nuevo pago
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        Regresar
                    </button>
                </div>
            </div>

            {/* Tarjeta de Filtros con el nuevo estilo */}
            <div className="filter-card">
                <h5 className="filter-title">Filtros de Búsqueda</h5>
                <div className="filter-grid">
                    <div className="filter-item">
                        <label htmlFor="pedidoId">ID Pedido</label>
                        <input
                            type="text"
                            id="pedidoId"
                            name="pedidoId"
                            placeholder="Buscar por ID..."
                            className="form-control"
                            value={filters.pedidoId}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-item">
                        <label htmlFor="metodoPago">Método de Pago</label>
                        <select
                            id="metodoPago"
                            name="metodoPago"
                            className="form-select"
                            value={filters.metodoPago}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Crédito">Crédito</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label htmlFor="fechaDesde">Fecha Desde</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                id="fechaDesde"
                                name="fechaDesde"
                                className="form-control"
                                value={filters.fechaDesde}
                                onChange={handleFilterChange}
                            />
                            <FaCalendarAlt className="date-icon" />
                        </div>
                    </div>
                    <div className="filter-item">
                        <label htmlFor="fechaHasta">Fecha Hasta</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                id="fechaHasta"
                                name="fechaHasta"
                                className="form-control"
                                value={filters.fechaHasta}
                                onChange={handleFilterChange}
                            />
                            <FaCalendarAlt className="date-icon" />
                        </div>
                    </div>
                    <div className="filter-item-button">
                        <button className="btn btn-outline-secondary" onClick={handleClearFilters}>
                            <FaRedo /> Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Pagos */}
            <div className="table-responsive">
                <table className="table table-hover table-modern">
                    <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>ID Pedido</th>
                            <th>Monto</th>
                            <th>Fecha Pago</th>
                            <th>Método</th>
                            <th>Total Pedido</th>
                            <th>Total Pagado</th>
                            <th>Saldo Pendiente</th>
                            <th>Estado Pedido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.length > 0 ? (
                            pagos.map((pago) => (
                                <tr key={pago.id}>
                                    <td>{pago.id}</td>
                                    <td>{pago.pedido_id}</td>
                                    <td>{formatCurrency(pago.monto)}</td> {/* <-- CORREGIDO */}
                                    <td>{new Date(pago.fecha_pago).toLocaleString()}</td>
                                    <td>{pago.metodo_pago}</td>
                                    <td>{formatCurrency(pago.total_pedido)}</td> {/* <-- CORREGIDO */}
                                    <td>{formatCurrency(pago.total_pagado_pedido_calculado)}</td> {/* <-- CORREGIDO */}
                                    <td>{formatCurrency(pago.saldo_pendiente_pedido_calculado)}</td> {/* <-- CORREGIDO */}
                                    <td>
                                      <span className={`badge bg-${pago.estado_pedido_actual === 'completado' ? 'success' : 'danger'}`}>
                                        {pago.estado_pedido_actual}
                                      </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">No hay pagos que coincidan con los filtros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Registro de Pago (sin cambios) */}
            {showRegistroModal && (
                <RegistrarPagoModal
                    onClose={handleCloseRegistroModal}
                    onSave={handleSavePago}
                />
            )}
        </div>
    );
};

export default PagosPage;