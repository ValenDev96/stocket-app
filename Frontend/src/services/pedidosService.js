// Contenido corregido y completo para: Frontend/src/services/pedidosService.js

const API_URL_BASE = 'http://localhost:3000/api';

// Función auxiliar para las cabeceras de autorización
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Obtiene la lista de todos los pedidos.
 */
export const obtenerPedidos = async () => {
  const endpoint = `${API_URL_BASE}/pedidos`;
  const response = await fetch(endpoint, {
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener los pedidos' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};

export const obtenerPedidosPendientes = async () => {
    const endpoint = `${API_URL_BASE}/pedidos/pendientes`;
    const response = await fetch(endpoint, {
        headers: createAuthHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener los pedidos pendientes' }));
        throw new Error(errorData.message);
    }
    return await response.json();
};


/**
 * Crea un nuevo pedido.
 * @param {object} pedidoData - Los datos del nuevo pedido.
 */
export const crearPedido = async (pedidoData) => {
  const endpoint = `${API_URL_BASE}/pedidos`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(pedidoData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al crear el pedido' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};


// --- FUNCIÓN AÑADIDA ---
/**
 * Actualiza un pedido existente.
 * @param {number} pedidoId - El ID del pedido a actualizar.
 * @param {object} datosActualizados - Los nuevos datos para el pedido.
 */
export const actualizarPedido = async (pedidoId, datosActualizados) => {
    // Asegúrate de que tu backend tenga una ruta PUT /api/pedidos/:id para manejar esta petición
    const endpoint = `${API_URL_BASE}/pedidos/${pedidoId}`;
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(datosActualizados)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el pedido' }));
        throw new Error(errorData.message);
    }
    return await response.json();
};

/**
 * Marca un pedido como devuelto y registra el motivo.
 * @param {number} pedidoId - El ID del pedido.
 * @param {string} motivo - El motivo de la devolución.
 */
export const marcarPedidoDevuelto = async (pedidoId, motivo) => {
    const endpoint = `${API_URL_BASE}/pedidos/${pedidoId}/devolver`;
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ motivo_devolucion: motivo })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al marcar como devuelto' }));
        throw new Error(errorData.message);
    }
    return await response.json();
};

/**
 * Obtiene los detalles completos de un solo pedido por su ID.
 * @param {number} pedidoId - El ID del pedido.
 */
export const obtenerPedidoPorId = async (pedidoId) => {
  const endpoint = `${API_URL_BASE}/pedidos/${pedidoId}`;
  const response = await fetch(endpoint, {
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener el detalle del pedido' }));
    throw new Error(errorData.message);
  }
  return await response.json();
};