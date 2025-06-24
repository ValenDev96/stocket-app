// Contenido para el nuevo archivo: Frontend/src/services/productosTerminadosService.js

const API_URL_BASE = 'http://localhost:3000/api';

// Función auxiliar para crear las cabeceras con el token actualizado
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

async function apiFetch(endpoint, method = 'GET', body = null) {
    const config = {
      method: method,
      headers: createAuthHeaders(),
    };
  
    if (body) {
      config.body = JSON.stringify(body);
    }
  
    const response = await fetch(endpoint, config);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error en la petición: ${response.statusText}` }));
      throw new Error(errorData.message || 'Ocurrió un error desconocido.');
    }

    // El método DELETE puede no devolver contenido
    if (response.status === 204) {
        return null;
    }
  
    return await response.json();
}

// --- Funciones CRUD para Productos Terminados ---

export const obtenerTodos = () => {
    return apiFetch(`${API_URL_BASE}/productos-terminados`);
};

export const crear = (productoData) => {
    return apiFetch(`${API_URL_BASE}/productos-terminados`, 'POST', productoData);
};

export const actualizar = (id, productoData) => {
    return apiFetch(`${API_URL_BASE}/productos-terminados/${id}`, 'PUT', productoData);
};

export const eliminar = (id) => {
    return apiFetch(`${API_URL_BASE}/productos-terminados/${id}`, 'DELETE');
};

/**
 * Obtiene un solo producto terminado por su ID.
 * @param {number} id - El ID del producto terminado.
 */
export const obtenerPorId = (id) => {
    return apiFetch(`${API_URL_BASE}/productos-terminados/${id}`);
};