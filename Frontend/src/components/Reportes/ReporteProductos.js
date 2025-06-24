// Archivo: src/components/Reportes/ReporteProductos.js

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { generarReporteProductos } from '../../services/reportesService'; // Usamos la nueva función

const ReporteProductos = () => {
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
            const data = await generarReporteProductos(fechas.fechaDesde, fechas.fechaHasta);
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
                <h2 className="titulo-principal">Productos más vendidos</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                    <i className="fas fa-arrow-left me-2"></i>
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
                    <h3 className="mt-4">Ranking de Productos</h3>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-modern">
                            <thead>
                                <tr>
                                    <th>Ranking</th>
                                    <th>Producto</th>
                                    <th>Cantidad Vendida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteData.length > 0 ? (
                                    reporteData.map((producto, index) => (
                                        <tr key={producto.producto_id}>
                                            <td><strong>#{index + 1}</strong></td>
                                            <td>{producto.nombre_producto}</td>
                                            <td>{producto.total_vendido} unidades</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No se encontraron ventas de productos en este período.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReporteProductos;