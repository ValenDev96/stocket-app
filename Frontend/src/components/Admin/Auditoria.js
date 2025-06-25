
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAuditoriaLogs } from '../../services/adminService';
import '../../styles/providers.css'; 

const Auditoria = () => {
    // Se declara 'logs' para poder usarlo, y 'setLogs' para poder actualizarlo.
    const [logs, setLogs] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [filters, setFilters] = useState({
        fechaDesde: '',
        fechaHasta: '',
        limit: 50
    });

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const fetchLogs = useCallback(async () => {
        try {
            setCargando(true);
            const data = await getAuditoriaLogs(filters);
            setLogs(data); // Ahora 'setLogs' está correctamente definido y se usa
        } catch (error) {
            toast.error('No se pudieron cargar los registros de auditoría.');
        } finally {
            setCargando(false);
        }
    // Se añade 'setLogs' al array de dependencias para cumplir la regla de Eslint.
    }, [filters, setLogs]);

    // Se deja este useEffect para que haga una carga inicial de datos al montar el componente.
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleApplyFilters = () => {
        fetchLogs();    
    };

    return (
        <div className="gestion-proveedores-page">
            <div className="page-header-modern">
                <h2>Registro de Auditoría del Sistema</h2>
            </div>

            <div className="filter-card mb-4">
                <h5 className="filter-title">Filtros de Búsqueda</h5>
                <div className="filter-grid">
                    <div className="filter-item">
                        <label htmlFor="fechaDesde">Fecha Desde</label>
                        <input type="date" id="fechaDesde" name="fechaDesde" value={filters.fechaDesde} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="filter-item">
                        <label htmlFor="fechaHasta">Fecha Hasta</label>
                        <input type="date" id="fechaHasta" name="fechaHasta" value={filters.fechaHasta} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="filter-item">
                        <label htmlFor="limit">Mostrar Registros</label>
                        <select id="limit" name="limit" value={filters.limit} onChange={handleFilterChange} className="form-select">
                            <option value="25">Últimos 25</option>
                            <option value="50">Últimos 50</option>
                            <option value="100">Últimos 100</option>
                            <option value="500">Últimos 500</option>
                        </select>
                    </div>
                    <div className="filter-item-button">
                        <button onClick={handleApplyFilters} className="btn btn-primary w-100" disabled={cargando}>
                            {cargando ? 'Buscando...' : 'Aplicar Filtros'}
                        </button>
                    </div>
                </div>
            </div>

            {cargando ? (
                 <div className="text-center mt-5"><div className="spinner-border"></div></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-modern table-bordered">
                        <thead>
                            <tr>
                                <th>Fecha y Hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Tabla Afectada</th>
                                <th>ID Registro</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.fecha_hora).toLocaleString()}</td>
                                        <td>{log.nombre_usuario || 'Sistema'}</td>
                                        <td>{log.accion}</td>
                                        <td>{log.tabla_afectada}</td>
                                        <td>{log.registro_id}</td>
                                        <td>{log.detalles}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No hay registros que coincidan con los filtros.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Auditoria;