import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const ROLES = {
    ADMIN: 'Administrador',
    PRODUCCION: 'Líder de Producción',
    BODEGA: 'Líder de Bodega',
    AUXILIAR: 'Auxiliar Administrativo'
};

const Sidebar = () => {
    const { usuario, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [reportesOpen, setReportesOpen] = useState(false);
    const navigate = useNavigate();

    if (!usuario) return null;

    const esAdmin = usuario.rol_nombre === ROLES.ADMIN;
    const puedeVerInventarioYProveedores = [ROLES.ADMIN, ROLES.BODEGA, ROLES.AUXILIAR].includes(usuario.rol_nombre);
    const puedeVerProduccionYProductos = [ROLES.ADMIN, ROLES.PRODUCCION].includes(usuario.rol_nombre);
    const puedeVerPedidos = [ROLES.ADMIN, ROLES.PRODUCCION, ROLES.AUXILIAR].includes(usuario.rol_nombre);
    const puedeVerPagos = [ROLES.ADMIN, ROLES.AUXILIAR].includes(usuario.rol_nombre);
    const puedeVerClientes = esAdmin || usuario.rol_nombre === ROLES.AUXILIAR;

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const toggleReportes = () => setReportesOpen(!reportesOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <h3 className="sidebar-title">{isSidebarOpen ? 'Stocket' : 'S'}</h3>
                <button onClick={toggleSidebar} className="sidebar-toggle">
                    <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="nav-link">
                    <i className="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </NavLink>

                {puedeVerInventarioYProveedores && (
                    <>
                        <NavLink to="/inventory" className="nav-link">
                            <i className="fas fa-boxes"></i>
                            <span>Inventario</span>
                        </NavLink>
                        <NavLink to="/providers" className="nav-link">
                            <i className="fas fa-truck-loading"></i>
                            <span>Proveedores</span>
                        </NavLink>
                    </>
                )}

                {puedeVerProduccionYProductos && (
                    <>
                        <NavLink to="/finished-products" className="nav-link">
                            <i className="fas fa-cookie-bite"></i>
                            <span>Productos</span>
                        </NavLink>
                        <NavLink to="/production" className="nav-link">
                            <i className="fas fa-industry"></i>
                            <span>Producción</span>
                        </NavLink>
                    </>
                )}

                {esAdmin && (
                    <NavLink to="/horas-trabajadas" className="nav-link">
                        <i className="fas fa-clock"></i>
                        <span>Horas de trabajo</span>
                    </NavLink>
                )}

                {puedeVerPedidos && (
                    <NavLink to="/orders" className="nav-link">
                        <i className="fas fa-clipboard-list"></i>
                        <span>Pedidos</span>
                    </NavLink>
                )}

                {puedeVerClientes && (
                    <NavLink to="/clientes" className="nav-link">
                        <i className="fas fa-users"></i>
                        <span>Clientes</span>
                    </NavLink>
                )}

                {puedeVerPagos && (
                    <NavLink to="/pagos" className="nav-link">
                        <i className="fas fa-dollar-sign"></i>
                        <span>Pagos</span>
                    </NavLink>
                )}

                {esAdmin && (
                    <>
                        <button onClick={toggleReportes} className="nav-link submenu-toggle">
                            <i className="fas fa-chart-bar"></i>
                            <span>Reportes</span>
                            <i className={`fas ${reportesOpen ? 'fa-chevron-up' : 'fa-chevron-down'} submenu-icon`}></i>
                        </button>
                        {reportesOpen && (
                            <div className="submenu">
                                <NavLink to="/reportes/ventas" className="nav-link sub-link">
                                    <i className="fas fa-chart-line"></i>
                                    <span>Ventas</span>
                                </NavLink>
                                <NavLink to="/reportes/productos" className="nav-link sub-link">
                                    <i className="fas fa-chart-pie"></i>
                                    <span>Fidelización</span>
                                </NavLink>
                            </div>
                        )}
                        <NavLink to="/admin/gestion-usuarios" className="nav-link">
                            <i className="fas fa-users-cog"></i>
                            <span>Admin Usuarios</span>
                        </NavLink>
                        <NavLink to="/admin/auditoria" className="nav-link">
                            <i className="fas fa-history"></i>
                            <span>Auditoría</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* --- SECCIÓN DEL FOOTER COMPLETAMENTE CORREGIDA --- */}
            <div className="sidebar-footer">
                <div className="user-info">
                    <i className="fas fa-user-circle"></i>
                    
                    {isSidebarOpen && (
                        <div className="user-details">
                            <span className="user-name">{usuario.nombre_usuario}</span>
                            <span className="user-role">{usuario.rol_nombre}</span>
                        </div>
                    )}

                    {/* El botón de ayuda ahora está aquí, dentro de user-info */}
                    {isSidebarOpen && (
                         <a 
                            href="/ManualDeUsuario.pdf" 
                            download="Manual de Usuario - Stocket.pdf" 
                            className="help-button-inline"
                            title="Descargar Manual de Usuario"
                        >
                            <i className="fas fa-question-circle"></i>
                        </a>
                    )}
                </div>
            
                <div className="footer-actions">
                    <button type="button" onClick={handleLogout} className="logout-button">
                        <i className="fas fa-sign-out-alt"></i>
                        {isSidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;