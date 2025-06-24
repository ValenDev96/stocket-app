const API_URL_BASE = 'http://localhost:3000/api';

const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const obtenerReceta = async (productoId) => {
  const response = await fetch(`${API_URL_BASE}/recetas/${productoId}`, {
      headers: createAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al obtener la receta');
  return await response.json();
};

export const guardarReceta = async (recetaData) => {
  const response = await fetch(`${API_URL_BASE}/recetas`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(recetaData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al guardar la receta');
  }
  return await response.json();
};