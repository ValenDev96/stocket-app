import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Este componente recibe los roles permitidos como una prop
const ProtectedRoute = ({ rolesPermitidos }) => {
    const { usuario, cargando } = useAuth();

    // Mientras el contexto de autenticación está verificando la sesión, no hacemos nada
    if (cargando) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    // Si no hay usuario, lo redirigimos a la página de login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si la ruta requiere roles específicos y el rol del usuario no está en la lista,
    // lo redirigimos al dashboard (o a una página de "Acceso Denegado").
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol_nombre)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Si el usuario está autenticado y tiene el rol correcto, renderizamos la página solicitada.
    // <Outlet /> es el marcador de posición para el componente de la ruta (ej. <GestionMateriasPrimas />)
    return <Outlet />;
};

export default ProtectedRoute;