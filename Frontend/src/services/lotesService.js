// Contenido para: Frontend/src/services/lotesService.js

const API_URL_BASE = 'http://localhost:3000/api'; // El puerto de tu backend

// Función auxiliar para añadir el token a las cabeceras
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Obtiene todos los lotes activos de una materia prima específica
 * @param {number} materiaPrimaId - El ID de la materia prima
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de lotes
 */
export const obtenerLotesPorMateriaPrima = async (materiaPrimaId) => {
  const response = await fetch(`${API_URL_BASE}/lotes/materia-prima/${materiaPrimaId}`, {
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener los lotes de la materia prima.' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

/**
 * "Elimina" (descarta) un lote específico por su ID.
 * @param {number} loteId - El ID del lote a descartar.
 */
export const descartarLote = async (loteId) => {
  const endpoint = `${API_URL_BASE}/lotes/${loteId}`;
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: createAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al descartar el lote.' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};