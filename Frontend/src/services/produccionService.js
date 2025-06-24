// En /services/produccionService.js

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
  // --- ESTA FUNCIÓN SE QUEDA IGUAL ---
  // He notado que la ruta es /registrar, asegúrate que en tu backend (produccionRoutes.js) la ruta POST sea '/' como sugerí antes, o ajusta la ruta aquí.
  // Por consistencia REST, la ruta POST debería ser simplemente '/', no '/registrar'.
  const response = await fetch(`${API_URL_BASE}/`, { // Ajustado a '/' por consistencia
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
  // --- ESTA FUNCIÓN SE QUEDA IGUAL ---
  const response = await fetch(`${API_URL_BASE}/historial`, {
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener el historial de producción.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};


// --- NUEVAS FUNCIONES AÑADIDAS ---

/**
 * Inicia el proceso de un lote de producción.
 * @param {number} id - El ID del lote de producción.
 */
export const iniciarProduccion = async (id) => {
  const response = await fetch(`${API_URL_BASE}/${id}/iniciar`, {
    method: 'PUT',
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al iniciar la producción.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};

/**
 * Finaliza el proceso de un lote de producción.
 * @param {number} id - El ID del lote de producción.
 */
export const finalizarProduccion = async (id) => {
  const response = await fetch(`${API_URL_BASE}/${id}/finalizar`, {
    method: 'PUT',
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al finalizar la producción.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};