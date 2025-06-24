import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAlertasActivas } from '../services/inventarioService';
import { getDashboardStats } from '../services/dashboardService';
import '../styles/Dashboard.css'; // Usaremos un nuevo CSS

// Componente reutilizable para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-card-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="stat-card-info">
            <span className="stat-card-title">{title}</span>
            <span className="stat-card-value">{value}</span>
        </div>
    </div>
);

function Dashboard() {
    const { usuario, cargando: cargandoAuth } = useAuth();
    const [alertas, setAlertas] = useState([]);
    const [stats, setStats] = useState({ stockBajo: 0, pedidosActivos: 0, produccionActiva: 0 });
    const [cargandoDatos, setCargandoDatos] = useState(true);

    const cargarDatosDashboard = useCallback(async () => {
        if (!usuario) return;
        
        setCargandoDatos(true);
        try {
            // Hacemos las llamadas a la API en paralelo para más eficiencia
            const [alertasData, statsData] = await Promise.all([
                getAlertasActivas(),
                getDashboardStats()
            ]);
            setAlertas(alertasData);
            setStats(statsData);
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
        } finally {
            setCargandoDatos(false);
        }
    }, [usuario]);

    useEffect(() => {
        if (!cargandoAuth && usuario) {
            cargarDatosDashboard();
        }
    }, [cargandoAuth, usuario, cargarDatosDashboard]);
    
    if (cargandoAuth || cargandoDatos) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    if (!usuario) return null;

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <h2 className="fade-in">Hola, {usuario.nombre_usuario}</h2>
                <p className="text-muted fade-in" style={{ animationDelay: '0.2s' }}>Aquí tienes un resumen de la operación de hoy.</p>
            </header>

            {/* Sección de Tarjetas de Estadísticas */}
            <section className="stats-grid">
                <StatCard title="Alertas de Stock Bajo" value={stats.stockBajo} icon="fa-exclamation-triangle" color="red" />
                <StatCard title="Pedidos Activos" value={stats.pedidosActivos} icon="fa-clipboard-list" color="blue" />
                <StatCard title="Lotes en Producción" value={stats.produccionActiva} icon="fa-industry" color="green" />
            </section>

            {/* Widget de Alertas Detalladas */}
            <section className="alertas-widget">
                <h4><i className="fas fa-bell"></i> Alertas de Inventario Recientes</h4>
                {alertas.length > 0 ? (
                    <ul className="lista-alertas">
                        {alertas.map(alerta => (
                            <li key={`${alerta.tipo_alerta}-${alerta.alerta_id}`} className={`alerta-item alerta-tipo-${alerta.tipo_alerta}`}>
                                <i className={`fas ${alerta.tipo_alerta === 'bajo_stock' ? 'fa-exclamation-triangle' : 'fa-hourglass-half'} alerta-icono`}></i>
                                {alerta.mensaje_alerta}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-alertas-mensaje">No hay alertas activas. ¡Todo en orden!</p>
                )}
            </section>
        </div>
    );
}

export default Dashboard;