const API_URL_BASE = 'http://localhost:3000/api'; // Puerto del backend

const getToken = () => localStorage.getItem('token');

// --- Funciones existentes para Materias Primas ---
export const getAllMateriasPrimas = async () => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener materias primas y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al obtener materias primas');
  }
  return response.json();
};

export const createMateriaPrima = async (materiaPrimaData) => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(materiaPrimaData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al crear materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al crear materia prima');
  }
  return response.json();
};

export const updateMateriaPrima = async (id, materiaPrimaData) => {
  const url = `${API_URL_BASE}/materiasprimas/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(materiaPrimaData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al actualizar materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al actualizar materia prima');
  }
  return response.json();
};

export const deleteMateriaPrima = async (id) => {
  const url = `${API_URL_BASE}/materiasprimas/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al eliminar materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al eliminar materia prima');
  }
  return response.json();
};

export const getMateriaPrimaById = async (id) => {
  const url = `${API_URL_BASE}/materiasprimas/${id}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener materia prima por ID y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al obtener la materia prima por ID');
  }
  return response.json();
};

// --- Funciones para Movimientos de Inventario ---
export const registrarMovimientoInventario = async (movimientoData) => {
  const url = `${API_URL_BASE}/movimientos`;
  // console.log('Registrando movimiento URL:', url, 'Datos:', movimientoData);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(movimientoData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.statusText}` }));
    throw new Error(errorData.message || 'Error desconocido al registrar el movimiento.');
  }
  return response.json();
};

export const getMovimientosPorMateriaPrima = async (materiaPrimaId) => {
  const url = `${API_URL_BASE}/movimientos/${materiaPrimaId}`;
  // console.log('Obteniendo movimientos URL:', url);
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.statusText}` }));
    throw new Error(errorData.message || 'Error desconocido al obtener el historial de movimientos.');
  }
  return response.json();
};

// --- NUEVA FUNCIÓN PARA OBTENER ALERTAS ---
/**
 * Obtiene todas las alertas activas del inventario.
 */
export const getAlertasActivas = async () => {
  const url = `${API_URL_BASE}/alertas/activas`;
  console.log('Obteniendo alertas activas URL:', url);

  const response = await fetch(url, {
    method: 'GET', // Aunque GET es el default, lo especificamos por claridad
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.statusText}` }));
    console.error('Error al obtener alertas activas:', errorData);
    throw new Error(errorData.message || 'Error desconocido al obtener las alertas.');
  }
  return response.json(); // Devuelve el array de alertas
};