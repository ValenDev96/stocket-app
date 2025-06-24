import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Importamos el nuevo Sidebar inteligente

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {/* <Outlet /> renderiza el componente de la ruta actual (ej. <Dashboard />) */}
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
