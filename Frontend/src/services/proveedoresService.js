import api from './api'; // Asegúrate que esta sea tu instancia de Axios

// 🔵 Obtener todos los proveedores (activos o inactivos)
export const obtenerProveedores = async () => {
  const { data } = await api.get('/proveedores');
  return data;
};

// 🟢 Crear un nuevo proveedor
export const crearProveedor = async (proveedorData) => {
  const { data } = await api.post('/proveedores', proveedorData);
  return data;
};

// 🟡 Obtener proveedor por ID (para editar)
export const getProveedorById = async (id) => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data;
};

// 🟠 Actualizar proveedor existente
export const actualizarProveedor = async (id, proveedorData) => {
  const { data } = await api.put(`/proveedores/${id}`, proveedorData);
  return data;
};

export const inactivarProveedor = async (id) => {
  const { data } = await api.put(`/proveedores/${id}/inactivar`);
  return data;
};

export const activarProveedor = async (id) => {
  const { data } = await api.put(`/proveedores/${id}/activar`);
  return data;
};

// 🔴 Eliminar proveedor (inactivar - DELETE soft)
export const eliminarProveedor = async (id) => {
  const { data } = await api.delete(`/proveedores/${id}`);
  return data;
};

// ✅ Registrar una compra a proveedor
export const registrarCompra = async (compraData) => {
  const { data } = await api.post('/compras', compraData);
  return data;
};

// ✅ Obtener historial de compras
export const obtenerHistorialCompras = async () => {
  const { data } = await api.get('/compras/historial');
  return data;
};

// ✅ Comparar precios de materias primas por proveedor (si aplica)
export const compararPrecios = async () => {
  const { data } = await api.get('/compras/comparar-precios');
  return data;
};
