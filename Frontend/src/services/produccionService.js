const API_URL_BASE = 'http://localhost:3000/api/produccion';

// Función auxiliar para crear las cabeceras con el token
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Registra un nuevo lote de producción en el backend.
 * @param {object} produccionData - Debe contener { producto_terminado_id, cantidad_producida }
 */
export const registrarProduccion = async (produccionData) => {
  const response = await fetch(`${API_URL_BASE}/registrar`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(produccionData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al registrar la producción.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};

/**
 * Obtiene el historial de todos los lotes de producción.
 */
export const obtenerHistorialProduccion = async () => {
  const response = await fetch(`${API_URL_BASE}/historial`, {
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener el historial de producción.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};