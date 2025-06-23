import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { generarReporteVentas } from '../../services/reportesService';
import '../../styles/Dashboard.css'; // Reutilizamos los estilos del dashboard para las tarjetas
import { formatCurrency, formatQuantity } from '../../utils/formatters';

// Componente de tarjeta de estadística reutilizado
const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-card-icon"><i className={`fas ${icon}`}></i></div>
        <div className="stat-card-info">
            <span className="stat-card-title">{title}</span>
            <span className="stat-card-value">{value}</span>
        </div>
    </div>
);

const ReporteVentas = () => {
    const navigate = useNavigate();
    const [fechas, setFechas] = useState({ fechaDesde: '', fechaHasta: '' });
    const [reporteData, setReporteData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFechas({ ...fechas, [e.target.name]: e.target.value });
    };

    const handleGenerarReporte = async () => {
        if (!fechas.fechaDesde || !fechas.fechaHasta) {
            toast.warn('Por favor, selecciona un rango de fechas.');
            return;
        }
        setLoading(true);
        setReporteData(null);
        try {
            const data = await generarReporteVentas(fechas.fechaDesde, fechas.fechaHasta);
            setReporteData(data);
        } catch (error) {
            toast.error(error.message || 'Error al generar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header-modern">
                <h2 className="titulo-principal">Reporte de ventas</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
        <i className="fas fa-arrow-left me-2"></i> {/* Ícono opcional para mejorar la UI */}
        Volver al Dashboard
    </button>
            </div>

            <div className="card p-3 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label htmlFor="fechaDesde" className="form-label">Desde</label>
                        <input type="date" className="form-control" id="fechaDesde" name="fechaDesde" value={fechas.fechaDesde} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="fechaHasta" className="form-label">Hasta</label>
                        <input type="date" className="form-control" id="fechaHasta" name="fechaHasta" value={fechas.fechaHasta} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-primary w-100" onClick={handleGenerarReporte} disabled={loading}>
                            {loading ? 'Generando...' : 'Generar Reporte'}
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>}

            {reporteData && (
                <div id="reporte-resultados">
                    <section className="stats-grid mb-4">
                        <StatCard title="Total en Ventas" value={formatCurrency(reporteData.stats.totalVentas || 0)} icon="fa-dollar-sign" color="green" />
                        <StatCard title="Número de Pedidos" value={formatQuantity(reporteData.stats.numeroPedidos || 0)} icon="fa-clipboard-list" color="blue" />
                    </section>

                    <h3 className="mt-4">Detalle de Pedidos</h3>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-modern">
                            <thead>
                                <tr>
                                    <th>ID Pedido</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteData.detalles.map(pedido => (
                                    <tr key={pedido.id}>
                                        <td>{pedido.id}</td>
                                        <td>{new Date(pedido.fecha_pedido).toLocaleString()}</td>
                                        <td>{pedido.nombre_cliente}</td>
                                        <td>{pedido.estado_pedido}</td>
                                        <td>{formatCurrency(pedido.total_pedido)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReporteVentas;