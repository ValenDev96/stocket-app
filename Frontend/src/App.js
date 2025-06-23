import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import "./styles/Modal.css";

// Componentes
import AppLayout from "./components/AppLayout";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from './components/ResetPassword';
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory/GestionMateriasPrimas";
import GestionProductosTerminados from "./components/Productos/GestionProductosTerminados";
import GestionRecetas from "./components/Recetas/GestionRecetas";
import GestionProduccion from "./components/Produccion/GestionProduccion";
import GestionProveedores from './components/proveedores/GestionProveedores';
import Orders from "./components/Orders";
import PedidoForm from "./components/Pedidos/PedidoForm";
import PedidoDetalle from "./components/Pedidos/PedidoDetalle";
import Providers from "./components/Providers";
import CompraForm from "./components/proveedores/CompraForm";
import HistorialCompras from "./components/proveedores/HistorialCompras";
import CrearUsuario from "./components/Admin/CrearUsuario";
import ClientesCrud from "./components/clientes/ClientesCrud";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ProveedorForm from "./components/proveedores/ProveedorForm";
import HorasTrabajadas from "./components/HorasTrabajadas/HorasTrabajadas";
import PagosPage from "./components/PagosPage";
import ReporteVentas from "./components/Reportes/ReporteVentas";
import ReporteProductos from "./components/Reportes/ReporteProductos";
import GestionUsuarios from "./components/Admin/GestionUsuarios";
import Auditoria from "./components/Admin/Auditoria";

const ROLES = {
  ADMIN: "Administrador",
  PRODUCCION: "Líder de Producción",
  BODEGA: "Líder de Bodega",
  AUXILIAR: "Auxiliar Administrativo",
};

const HomePage = () => {
  const { usuario, cargando } = useAuth();
  if (cargando) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }
  return usuario ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.PRODUCCION, ROLES.BODEGA, ROLES.AUXILIAR]} />}>
              <Route path="/horas-trabajadas" element={<HorasTrabajadas />} />
            </Route>

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.BODEGA, ROLES.AUXILIAR]} />}>
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/register-purchase" element={<CompraForm />} />
              <Route path="/providers/historial" element={<HistorialCompras />} />
              <Route path="/providers/proveedor" element={<ProveedorForm />} />
              <Route path="/providers/gestion" element={<GestionProveedores />} />
              <Route path="/clientes" element={<ClientesCrud />} />
            </Route>

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.PRODUCCION]} />}>
              <Route path="/finished-products" element={<GestionProductosTerminados />} />
              <Route path="/recetas/:productoId" element={<GestionRecetas />} />
              <Route path="/production" element={<GestionProduccion />} />
            </Route>

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.PRODUCCION, ROLES.AUXILIAR]} />}>
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/new" element={<PedidoForm />} />
              <Route path="/orders/:id" element={<PedidoDetalle />} />
            </Route>

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUXILIAR]} />}>
              <Route path="/pagos" element={<PagosPage />} />
            </Route>

            <Route element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN]} />}>
              <Route path="/admin/crear-usuario" element={<CrearUsuario />} />

              <Route path="/admin/gestion-usuarios" element={<GestionUsuarios />} />
              <Route path="/admin/auditoria" element={<Auditoria />} />

              {/* ✅ Rutas de Reportes solo para Admin */}
              <Route path="/reportes/ventas" element={<ReporteVentas />} />
              <Route path="/reportes/productos" element={<ReporteProductos />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ToastContainer autoClose={3000} hideProgressBar />
      </Router>
    </AuthProvider>
  );
}

export default App;
