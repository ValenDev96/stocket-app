// Contenido corregido y completo para: Frontend/src/services/historialComprasServices.js

// La URL base de tu API
const API_URL_BASE = 'http://localhost:3000/api';

// Función auxiliar para añadir el token a las cabeceras
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Obtiene el historial completo de todas las compras a proveedores.
 * Llama a la ruta GET /api/proveedores/compras
 * @returns {Promise<Array>} - Una promesa que resuelve a un array con el historial de compras.
 */
export const obtenerHistorialCompras = async () => {
  
  // Se apunta a la ruta correcta del backend: '/api/proveedores/compras'
  const endpoint = `${API_URL_BASE}/proveedores/compras`;

  const response = await fetch(endpoint, {
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener historial de compras' }));
    throw new Error(errorData.message);
  }

  return await response.json();
};