const API_URL_BASE = 'http://localhost:3000/api'; // Asegúrate que este sea el puerto de tu backend

// Función auxiliar para crear las cabeceras con el token actualizado
const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// --- Funciones para Materias Primas ---
export const obtenerTodasMateriasPrimas = async () => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener materias primas' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const crearMateriaPrima = async (materiaPrimaData) => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(materiaPrimaData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al crear materia prima' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const actualizarMateriaPrima = async (id, materiaPrimaData) => {
  const datosParaActualizar = {
    nombre: materiaPrimaData.nombre,
    descripcion: materiaPrimaData.descripcion,
    unidad_medida: materiaPrimaData.unidad_medida,
    umbral_alerta: materiaPrimaData.umbral_alerta,
  };
  const response = await fetch(`${API_URL_BASE}/materiasprimas/${id}`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify(datosParaActualizar),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al actualizar materia prima' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const eliminarMateriaPrima = async (id) => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas/${id}`, {
    method: 'DELETE',
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al eliminar materia prima' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

// --- Función para Obtener Alertas ---
export const getAlertasActivas = async () => {
  const response = await fetch(`${API_URL_BASE}/alertas/activas`, {
    headers: createAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener alertas' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

// --- FUNCIÓN AÑADIDA ---
/**
 * Registra un nuevo movimiento de inventario (ej. ajuste manual).
 * @param {object} movimientoData - Los datos del movimiento (lote_id, tipo_movimiento, etc.)
 */
export const registrarMovimientoInventario = async (movimientoData) => {
    const response = await fetch(`${API_URL_BASE}/movimientos`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(movimientoData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al registrar el movimiento.' }));
        throw new Error(errorData.message);
    }
    return response.json();
};