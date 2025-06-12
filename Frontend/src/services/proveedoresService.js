
const API_URL = 'http://localhost:3000/api/proveedores';

// --- Función Auxiliar para manejar las peticiones a la API ---
// Esta función centraliza la lógica de autenticación y manejo de errores.
async function apiFetch(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const config = {
    method: method,
    headers: headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);

  // Manejo de errores mejorado: Intenta leer el mensaje de error del backend.
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error en la petición: ${response.statusText}` }));
    throw new Error(errorData.message || 'Ocurrió un error desconocido.');
  }

  // Si la respuesta no tiene contenido (ej. en un DELETE), no intenta parsear JSON.
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}


// --- Las funciones de servicio ahora son más simples y limpias ---

/**
 * Obtiene la lista de todos los proveedores.
 */
export const obtenerProveedores = () => {
  return apiFetch(API_URL);
};

/**
 * Crea un nuevo proveedor.
 * @param {object} nuevoProveedor - Datos del proveedor a crear.
 */
export const crearProveedor = (nuevoProveedor) => {
  return apiFetch(API_URL, 'POST', nuevoProveedor);
};

/**
 * Registra una nueva compra y su lote asociado.
 * @param {object} compraData - Datos de la compra.
 */
export const registrarCompra = (compraData) => {
  return apiFetch(`${API_URL}/compras`, 'POST', compraData);
};

/**
 * Obtiene el historial de todas las compras registradas.
 */
export const obtenerHistorialCompras = () => {
  return apiFetch(`${API_URL}/compras`);
};

/**
 * Compara precios de un producto entre diferentes proveedores.
 * @param {string} nombreProducto - El nombre de la materia prima a comparar.
 */
export const compararPrecios = (nombreProducto) => {
  const endpoint = `${API_URL}/comparar-precios?producto=${encodeURIComponent(nombreProducto)}`;
  return apiFetch(endpoint);
};