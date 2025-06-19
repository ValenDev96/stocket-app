import React, { useState } from 'react';
// --- CORRECCIÓN: Importamos 'useNavigate' para la redirección ---
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
    // --- CORRECCIÓN: Inicializamos useNavigate ---
    const navigate = useNavigate();

    if (!usuario) { return null; }

    const puedeVerInventarioYProveedores = [ROLES.ADMIN, ROLES.BODEGA, ROLES.AUXILIAR].includes(usuario.rol_nombre);
    const puedeVerProduccionYProductos = [ROLES.ADMIN, ROLES.PRODUCCION].includes(usuario.rol_nombre);
    const puedeVerPedidos = [ROLES.ADMIN, ROLES.PRODUCCION, ROLES.AUXILIAR].includes(usuario.rol_nombre);
    const puedeVerHorasTrabajadas = [ROLES.ADMIN, ROLES.BODEGA, ROLES.AUXILIAR].includes(usuario.rol_nombre); // Nueva línea
    const esAdmin = usuario.rol_nombre === ROLES.ADMIN;

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // --- CORRECCIÓN: Nueva función para manejar el logout ---
    const handleLogout = () => {
        logout(); // Limpia el contexto y localStorage
        navigate('/login'); // Redirige al login
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

                {/* ✅ Nuevo enlace para Horas de Trabajo */}
                {puedeVerHorasTrabajadas && (
                    <NavLink to="/horas-trabajadas" className="nav-link">
                        <i className="fas fa-clock"></i>
                        <span>Horas de Trabajo</span>
                    </NavLink>
                )}

                {puedeVerPedidos && (
                    <NavLink to="/orders" className="nav-link">
                        <i className="fas fa-clipboard-list"></i>
                        <span>Pedidos</span>
                    </NavLink>
                )}
                 {/* ✅ Enlace para el módulo Clientes */}
                {(usuario.rol_nombre === ROLES.ADMIN || usuario.rol_nombre === ROLES.AUXILIAR) && (
                    <NavLink to="/clientes" className="nav-link">
                        <i className="fas fa-users"></i>
                        <span>Clientes</span>
                    </NavLink>
                )}

                {esAdmin && (
                    <NavLink to="/admin/crear-usuario" className="nav-link">
                        <i className="fas fa-user-plus"></i>
                        <span>Admin Usuarios</span>
                    </NavLink>
                )}
            </nav>
            <div className="sidebar-footer">
                <div className="user-info">
                    <i className="fas fa-user-circle"></i>
                    <div className="user-details">
                        <span className="user-name">{usuario.nombre_usuario}</span>
                        <span className="user-role">{usuario.rol_nombre}</span>
                    </div>
                </div>
                 {/* --- CORRECCIÓN: El botón ahora llama a handleLogout --- */}
                <button onClick={handleLogout} className="logout-button">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;